// 3.3V circuit - Sump Pump Controller
#include <xc.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include "config.h"

// Direct register mapping for XC8 v3.10 compatibility
#define CMCON    (*(volatile __near unsigned char*)0xFB4)
#define CVRCON (*(volatile __near unsigned char*)0xFB5)

// Configuration for 18LF2580
#pragma config OSC = HS
#pragma config WDT = ON
#pragma config WDTPS = 4096
#pragma config BOREN = OFF
#pragma config LVP = OFF

#define _XTAL_FREQ 20000000

// Hardware Mapping
#define SSR_out            LATA5           
#define TRIS_SSR           TRISA5          
#define Display_Pin        LATBbits.LATB4  
#define TRIS_Display       TRISB4          

// Circular Buffer for Display
#define DISP_BUF_SIZE 255
volatile char disp_buffer[DISP_BUF_SIZE];
volatile uint8_t disp_head = 0;
volatile uint8_t disp_tail = 0;

// Timing variables for Seetron serial backpack
uint16_t displayDelayCounter = 0; 

// Shadow Buffer to track current screen state (4 lines x 20 columns)
char screen_shadow[4][20];

// Application Variables
uint8_t wasOn = 0, wasOff = 0, triggerSecondCount = 0;
uint8_t highLevelStatus, lowLevelStatus, timeToDisplay = 0;
uint32_t secondsSincePowerup = 0;
uint16_t hoursSincePowerup = 0, currentOnTime = 0, currentOffTime = 0, secondsCounter = 0;
uint8_t pumpState = 0; 

// ESP State Machine
typedef enum { ESP_IDLE, ESP_START_CONNECT, ESP_WAIT_CONNECT, ESP_START_SEND_CMD, ESP_WAIT_PROMPT, ESP_SEND_DATA, ESP_WAIT_SEND_OK } esp_state_t;
esp_state_t currentEspState = ESP_IDLE;
uint16_t espTimer = 0;
volatile char rx_buf[64];
volatile uint8_t rx_idx = 0;

// Function Prototypes
void put_to_disp_buf(const char* str);
void process_display_buffer(void);
int8_t updateDisplayCoord(uint8_t line, uint8_t column, const char* str);
void software_putch(char data); 
extern void uart_send_string(const char* s);
void process_esp_state_machine(void);
uint16_t read_ADC(uint8_t channel);

void __interrupt() v_isr(void) {
    if (INTCONbits.TMR0IF) {
        secondsCounter++;
        if (secondsCounter >= 19531) { 
            secondsCounter = 0;
            triggerSecondCount = 1;
            if (espTimer > 0) espTimer--; 
        }
        INTCONbits.TMR0IF = 0; 
    }
    if (PIR1bits.RCIF) {
        char c = RCREG; 
        if (rx_idx < 63) {
            rx_buf[rx_idx++] = c;
            rx_buf[rx_idx] = '\0';
        }
        if (RCSTAbits.OERR) { RCSTAbits.CREN = 0; RCSTAbits.CREN = 1; }
    }
}

// Inverted Logic 9600 Baud Bit-bang
void software_putch(char data) {
    uint8_t status = INTCONbits.GIE;
    INTCONbits.GIE = 0; 
    Display_Pin = 0;      
    __delay_us(150);      
    Display_Pin = 1;      
    __delay_us(102);      
    for(uint8_t b=0; b<8; b++) {
        if(data & 0x01) Display_Pin = 0; 
        else Display_Pin = 1; 
        data >>= 1;
        __delay_us(102);
    }
    Display_Pin = 0;      
    __delay_us(200);      
    INTCONbits.GIE = status; 
}

void put_to_disp_buf(const char* str) {
    while(*str) {
        uint8_t next = (disp_head + 1) % DISP_BUF_SIZE;
        if(next != disp_tail) {
            disp_buffer[disp_head] = *str++;
            disp_head = next;
        } else break;
    }
}

void process_display_buffer(void) {
    if (displayDelayCounter > 0) {
        displayDelayCounter--; 
        return; 
    }
    if(disp_head != disp_tail) {
        char c = disp_buffer[disp_tail];
        software_putch(c);
        if (c < 32) displayDelayCounter = 1000; 
        else displayDelayCounter = 100; 
        disp_tail = (disp_tail + 1) % DISP_BUF_SIZE;
    }
}

int8_t updateDisplayCoord(uint8_t line, uint8_t column, const char* str) {
    uint8_t line_idx = line - 1;
    uint8_t col_idx = column - 1;
    uint8_t str_len = strlen(str);
    uint8_t needs_update = 0;
    for (uint8_t i = 0; i < str_len; i++) {
        if (screen_shadow[line_idx][col_idx + i] != str[i]) {
            needs_update = 1;
            break;
        }
    }
    if (!needs_update) return 1;
    char home_cmd[2] = {1, '\0'};
    put_to_disp_buf(home_cmd);
    char down_cmd[2] = {10, '\0'};
    for (uint8_t i = 0; i < line_idx; i++) put_to_disp_buf(down_cmd);
    char right_cmd[2] = {9, '\0'};
    for (uint8_t i = 0; i < col_idx; i++) put_to_disp_buf(right_cmd);
    while (*str) {
        screen_shadow[line_idx][col_idx] = *str;
        char temp[2] = {*str++, '\0'};
        put_to_disp_buf(temp);
        col_idx++;
    }
    return 1;
}

uint16_t read_ADC(uint8_t channel) {
    // Select channel, turn on ADC
    ADCON0 = (uint8_t)((channel << 2) | 0x01); 
    // Wait for acquisition time (capacitor charge)
    __delay_us(25); 
    ADCON0bits.GO = 1; 
    while(ADCON0bits.GO); 
    return (uint16_t)((ADRESH << 8) | ADRESL);
}

void uart_send_string(const char* s) {
    while(*s) {
        while(!PIR1bits.TXIF); 
        TXREG = *s++;          
    }
}

void process_esp_state_machine(void) {
    static char data_str[64]; 
    char cmd_str[64]; 
    switch(currentEspState) {
        case ESP_IDLE: break;
        case ESP_START_CONNECT:
            rx_idx = 0; 
            sprintf(cmd_str, "AT+CIPSTART=\"TCP\",\"%s\",%s\r\n", SERVER_IP, SERVER_PORT);
            espTimer = 5; currentEspState = ESP_WAIT_CONNECT;
            break;
        case ESP_WAIT_CONNECT:
            if(strstr((const char*)rx_buf, "OK") || strstr((const char*)rx_buf, "ALREADY CONNECTED")) currentEspState = ESP_START_SEND_CMD;
            else if (espTimer == 0) currentEspState = ESP_IDLE;
            break;
        case ESP_START_SEND_CMD:
            sprintf(data_str, "{\"on\":\"%u\",\"off\":\"%u\",\"hrs\":\"%u\"}\r\n", currentOnTime, currentOffTime, hoursSincePowerup);
            sprintf(cmd_str, "AT+CIPSEND=%d\r\n", (int)strlen(data_str));
            rx_idx = 0; 
            uart_send_string(cmd_str);
            espTimer = 2; currentEspState = ESP_WAIT_PROMPT;
            break;
        case ESP_WAIT_PROMPT:
            if(strstr((const char*)rx_buf, ">")) currentEspState = ESP_SEND_DATA;
            else if (espTimer == 0) currentEspState = ESP_IDLE;
            break;
        case ESP_SEND_DATA:
            rx_idx = 0; 
            uart_send_string(data_str);
            espTimer = 3; currentEspState = ESP_WAIT_SEND_OK;
            break;
        case ESP_WAIT_SEND_OK:
            if(strstr((const char*)rx_buf, "SEND OK")) {
                espTimer = 2; currentEspState = ESP_IDLE;
            } else if (espTimer == 0) currentEspState = ESP_IDLE;
            break;
    }
}

void main(void) {
    // ADC Setup
    ADCON1 = 0x0D; 
    TRISA0 = 1; // AN0
    TRISA1 = 1; // AN1
    ADCON2 = 0xBE;
    // Disable Comparators for ADC usage
    CMCON = 0x0F; 

    TRIS_SSR = 0; 
    TRIS_Display = 0; Display_Pin = 0;    
    TRISC6 = 0; TRISC7 = 1; SPBRG = 129; TXSTA = 0x24; RCSTA = 0x90; BAUDCONbits.TXCKP = 0; 
    T0CON = 0xC0;       
    
    __delay_ms(1000); 
    memset(screen_shadow, ' ', sizeof(screen_shadow));
    
    software_putch(12); // Clear
    __delay_ms(15);
    software_putch(13); // Underline Cursor
    __delay_ms(15);
    software_putch(14); // Backlight
    __delay_ms(15);
            
    updateDisplayCoord(1, 1, "Sump Pump Controller");
    updateDisplayCoord(2, 1, "Starting up...      ");
    __delay_ms(1500);
    
    software_putch(12); // Clear
    __delay_ms(15);
    memset(screen_shadow, ' ', sizeof(screen_shadow));
    
    PIE1bits.RCIE = 1; INTCONbits.TMR0IE = 1; INTCONbits.PEIE = 1; INTCONbits.GIE = 1;    

    while (1) {
        CLRWDT(); 
        process_display_buffer(); 

        uint16_t adc0 = read_ADC(0);
        uint16_t adc1 = read_ADC(1);
        lowLevelStatus = (uint8_t)(adc0 < 512);  
        highLevelStatus = (uint8_t)(adc1 < 512);
        
        if (highLevelStatus && lowLevelStatus) { SSR_out = 1; pumpState = 1; }
        if (!lowLevelStatus && !highLevelStatus) {
            SSR_out = 0;
            if(pumpState == 1 && currentEspState == ESP_IDLE) currentEspState = ESP_START_CONNECT; 
            pumpState = 0; 
        }

        if (triggerSecondCount) {
            triggerSecondCount = 0; timeToDisplay = 1; secondsSincePowerup++;
            if (secondsSincePowerup % 3600 == 0) hoursSincePowerup++;
            if (pumpState == 1) {
                wasOn = 1;
                if (wasOff) { wasOff = 0; currentOffTime = 0; }
                currentOnTime++;
            } else {
                wasOff = 1;
                if (wasOn) { wasOn = 0; currentOnTime = 0; }
                currentOffTime++;
            }
        }

        if (timeToDisplay) {
            char line1[21], line2[21], line3[21], line4[21];
            const char* esp_status = (currentEspState == ESP_IDLE) ? " ok " : "...."; 

            sprintf(line1, "Hadc:%04u Ladc:%04u", adc1, adc0);
            updateDisplayCoord(1, 1, line1);

            if (pumpState == 1) sprintf(line2, "TimeOn:%05u   %s", currentOnTime, esp_status);
            else sprintf(line2, "TimeOff:%05u  %s", currentOffTime, esp_status);
            updateDisplayCoord(2, 1, line2);

            sprintf(line3, "TotalHrs:%06u", hoursSincePowerup);
            updateDisplayCoord(3, 1, line3);

            sprintf(line4, "Pump:%s H:%u L:%u", (pumpState == 1 ? "on " : "off"), highLevelStatus, lowLevelStatus);
            updateDisplayCoord(4, 1, line4);

            timeToDisplay = 0;
        }
        process_esp_state_machine();
    }
}