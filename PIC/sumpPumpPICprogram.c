// 3.3V circuit - Sump Pump Controller
#include <xc.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include "config.h"

#ifndef CMCON
#define CMCON  (*(volatile __near unsigned char*)0xFB4)
#endif
#define CVRCON (*(volatile __near unsigned char*)0xFB5)
#define PIR2_REG (*(volatile __near unsigned char*)0xFA1)

#pragma config OSC = HS         
#pragma config WDT = ON         
#pragma config WDTPS = 4096     
#pragma config BOREN = OFF      
#pragma config LVP = OFF        

#define _XTAL_FREQ 20000000

#define SSR_out            LATA5           
#define TRIS_SSR           TRISA5          
#define Display_Pin        LATBbits.LATB4  
#define TRIS_Display       TRISB4          
#define SENSOR_PWR         LATA3

#define DISP_BUF_SIZE 255
volatile char disp_buffer[DISP_BUF_SIZE];
volatile uint8_t disp_head = 0;
volatile uint8_t disp_tail = 0;

uint16_t displayDelayCounter = 0; 
uint8_t wasOn = 0, wasOff = 0, triggerSecondCount = 0;
uint8_t highLevelStatus, lowLevelStatus, timeToDisplay = 0;
uint32_t secondsSincePowerup = 0;
uint16_t hoursSincePowerup = 0, currentOnTime = 0, currentOffTime = 0, secondsCounter = 0;
uint16_t lastOnTime = 0, lastOffTime = 0;
uint8_t pumpState = 0; 
uint8_t initialSendDone = 0;

uint16_t low_val = 0, high_val = 0;
uint16_t low_filtered = 1000, high_filtered = 1000;
uint32_t lowSum = 0, highSum = 0;
uint16_t sampleCount = 0;
uint16_t lastLatod = 0, lastHatod = 0;

typedef enum { ESP_IDLE, ESP_START_CONNECT, ESP_WAIT_AT, ESP_WAIT_CONNECT, ESP_START_SEND_CMD, ESP_WAIT_PROMPT, ESP_SEND_DATA, ESP_WAIT_SEND_OK } esp_state_t;
esp_state_t currentEspState = ESP_IDLE;
uint16_t espTimer = 0;
volatile char rx_buf[64];
volatile uint8_t rx_idx = 0;

void put_to_disp_buf(const char* str);
void process_display_buffer(void);
int8_t updateDisplayCoord(uint8_t line, uint8_t column, const char* str);
void software_putch(char data); 
void uart_send_string(const char* s);
void process_esp_state_machine(void);
void clear_display(void);
uint16_t read_adc(uint8_t channel);

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

uint16_t read_adc(uint8_t channel) {
    ADCON0 = (uint8_t)((channel << 2) & 0x3C); 
    ADCON0bits.ADON = 1;
    __delay_us(20); 
    ADCON0bits.GO = 1;
    while(ADCON0bits.GO);
    return (uint16_t)((ADRESH << 8) | ADRESL);
}

void software_putch(char data) {
    uint8_t status = INTCONbits.GIE;
    INTCONbits.GIE = 0; 
    Display_Pin = 1; 
    __delay_us(104); 
    for(uint8_t b=0; b<8; b++) {
        if((data >> b) & 0x01) Display_Pin = 0;
        else Display_Pin = 1;
        __delay_us(104);
    }
    Display_Pin = 0; 
    __delay_us(104);
    INTCONbits.GIE = status; 
}

void clear_display(void) {
    char cmd[2] = {12, '\0'};
    put_to_disp_buf(cmd);
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
    if (displayDelayCounter > 0) { displayDelayCounter--; return; }
    
    if(disp_head != disp_tail && currentEspState == ESP_IDLE) {
        char c = disp_buffer[disp_tail];
        software_putch(c);
        if (c < 32) displayDelayCounter = 500; 
        else displayDelayCounter = 5; 
        disp_tail = (disp_tail + 1) % DISP_BUF_SIZE;
    }
}

int8_t updateDisplayCoord(uint8_t line, uint8_t column, const char* str) {
    uint8_t addr;
    switch (line) {
        case 1: addr = 64 + (column - 1); break; 
        case 2: addr = 84 + (column - 1); break; 
        case 3: addr = 104 + (column - 1); break;
        case 4: addr = 124 + (column - 1); break;
        default: return 0;
    }
    char cmd_seq[3] = {16, addr, '\0'};
    put_to_disp_buf(cmd_seq);
    put_to_disp_buf(str);
    return 1;
}

void uart_send_string(const char* s) {
    while(*s) {
        while(!PIR1bits.TXIF); 
        TXREG = *s++;          
    }
}

void process_esp_state_machine(void) {
    char data_str[160], cmd_str[64];
    char error_display[21];
    if (pumpState == 1) { currentEspState = ESP_IDLE; return; }

    switch(currentEspState) {
        case ESP_IDLE: break;
        case ESP_START_CONNECT:
            RCSTAbits.CREN = 0; RCSTAbits.CREN = 1;
            rx_idx = 0; rx_buf[0] = '\0';
            uart_send_string("ATE0\r\n");
            espTimer = 3; currentEspState = ESP_WAIT_AT;
            break;
        case ESP_WAIT_AT:
            if(strstr((const char*)rx_buf, "OK")) {
                rx_idx = 0; rx_buf[0] = '\0';
                // [Correction: Utilizing SERVER_IP and SERVER_PORT from config.h]
                sprintf(cmd_str, "AT+CIPSTART=\"TCP\",\"%s\",%s\r\n", SERVER_IP, SERVER_PORT);
                uart_send_string(cmd_str);
                espTimer = 10; currentEspState = ESP_WAIT_CONNECT;
            } else if (espTimer == 0) {
                snprintf(error_display, 20, "AT-E:%s", (rx_idx > 0) ? (char*)rx_buf : "TO");
                updateDisplayCoord(4, 1, error_display);
                currentEspState = ESP_IDLE;
            }
            break;
        case ESP_WAIT_CONNECT:
            if(strstr((const char*)rx_buf, "OK") || strstr((const char*)rx_buf, "ALREADY CONNECTED")) {
                rx_idx = 0; rx_buf[0] = '\0';
                currentEspState = ESP_START_SEND_CMD;
            } else if (espTimer == 0) { 
                snprintf(error_display, 20, "C-E:%s", (rx_idx > 0) ? (char*)rx_buf : "TO");
                updateDisplayCoord(4, 1, error_display);
                currentEspState = ESP_IDLE; 
            }
            break;
        case ESP_START_SEND_CMD:
            // [Correction: Used literal keys Hadc, Ladc, hoursOn, timeOn, timeOff]
            sprintf(data_str, "{\"Hadc\":%u,\"Ladc\":%u,\"hoursOn\":%u,\"timeOn\":%u,\"timeOff\":%u}\r\n", 
                    lastHatod, lastLatod, hoursSincePowerup, lastOnTime, lastOffTime);
            sprintf(cmd_str, "AT+CIPSEND=%d\r\n", (int)strlen(data_str));
            rx_idx = 0; rx_buf[0] = '\0';
            uart_send_string(cmd_str);
            espTimer = 2; currentEspState = ESP_WAIT_PROMPT;
            break;
        case ESP_WAIT_PROMPT:
            if(strstr((const char*)rx_buf, ">")) {
                rx_idx = 0; rx_buf[0] = '\0';
                currentEspState = ESP_SEND_DATA;
            } else if (espTimer == 0) {
                snprintf(error_display, 20, "P-E:%s", (rx_idx > 0) ? (char*)rx_buf : "TO");
                updateDisplayCoord(4, 1, error_display);
                currentEspState = ESP_IDLE;
            }
            break;
        case ESP_SEND_DATA:
            sprintf(data_str, "{\"Hadc\":%u,\"Ladc\":%u,\"hoursOn\":%u,\"timeOn\":%u,\"timeOff\":%u}\r\n", 
                    lastHatod, lastLatod, hoursSincePowerup, lastOnTime, lastOffTime);
            rx_idx = 0; rx_buf[0] = '\0';
            uart_send_string(data_str);
            espTimer = 3; currentEspState = ESP_WAIT_SEND_OK;
            break;
        case ESP_WAIT_SEND_OK:
            if(strstr((const char*)rx_buf, "SEND OK")) {
                updateDisplayCoord(4, 1, "ESP: Data Sent OK   ");
                currentEspState = ESP_IDLE;
            } else if (espTimer == 0) {
                snprintf(error_display, 20, "S-E:%s", (rx_idx > 0) ? (char*)rx_buf : "TO");
                updateDisplayCoord(4, 1, error_display);
                currentEspState = ESP_IDLE;
            }
            break;
    }
}

void main(void) {
    ADCON1 = 0x0D; ADCON2 = 0x92; TRISA = 0x07; TRISA3 = 0; TRIS_SSR = 0; 
    Display_Pin = 0; TRIS_Display = 0; CVRCON = 0x00; CMCON = 0x07;  
    TRISC6 = 0; TRISC7 = 1; 
    SPBRG = 10; TXSTA = 0x24; RCSTA = 0x90; // 115200 baud
    
    T0CON = 0xC0;       
    __delay_ms(1000); 
    clear_display();
    PIE1bits.RCIE = 1; INTCONbits.TMR0IE = 1; INTCONbits.PEIE = 1; INTCONbits.GIE = 1;    
    SENSOR_PWR = 1;

    while (1) {
        CLRWDT(); 
        process_display_buffer(); 

        low_val = read_adc(0);
        high_val = read_adc(1);
        low_filtered = (uint16_t)((low_val >> 3) + (low_filtered - (low_filtered >> 3)));
        high_filtered = (uint16_t)((high_val >> 3) + (high_filtered - (high_filtered >> 3)));

        lowLevelStatus = (low_filtered < 700) ? 1 : 0;
        highLevelStatus = (high_filtered < 700) ? 1 : 0;
        
        if (highLevelStatus) { 
            SSR_out = 1; 
            if (pumpState == 0) { lowSum = 0; highSum = 0; sampleCount = 0; }
            pumpState = 1; 
        }
        else if (!lowLevelStatus) { 
            SSR_out = 0; 
            if (pumpState == 1) { 
                if (sampleCount > 0) {
                    lastLatod = (uint16_t)(lowSum / sampleCount);
                    lastHatod = (uint16_t)(highSum / sampleCount);
                }
                if (currentEspState == ESP_IDLE) currentEspState = ESP_START_CONNECT; 
            }
            pumpState = 0; 
        }

        if (triggerSecondCount) {
            triggerSecondCount = 0; timeToDisplay = 1; secondsSincePowerup++;
            if (secondsSincePowerup == 1 && !initialSendDone) {
                if (currentEspState == ESP_IDLE) currentEspState = ESP_START_CONNECT;
                initialSendDone = 1;
            }
            if (pumpState == 1) {
                lowSum += low_val; highSum += high_val; sampleCount++;
                currentOnTime++; wasOn = 1;
                if (wasOff) { lastOffTime = currentOffTime; currentOffTime = 0; wasOff = 0; }
            } else {
                currentOffTime++; wasOff = 1;
                if (wasOn) { lastOnTime = currentOnTime; currentOnTime = 0; wasOn = 0; }
            }
            if (secondsSincePowerup % 3600 == 0) hoursSincePowerup++;
        }

        if (timeToDisplay) {
            char line1[21], line2[21], line3[21];
            sprintf(line1, "L:%04u H:%04u %s", low_val, high_val, (pumpState) ? "P-ON " : "P-OFF");
            sprintf(line2, "On:%04u Off:%04u", (pumpState) ? currentOnTime : lastOnTime, (pumpState) ? lastOffTime : currentOffTime);
            sprintf(line3, "Total Hrs: %05u", hoursSincePowerup);
            
            updateDisplayCoord(1, 1, line1);
            updateDisplayCoord(2, 1, line2);
            updateDisplayCoord(3, 1, line3);
            if (pumpState == 1) updateDisplayCoord(4, 1, "Pumping Cycle...    ");
            timeToDisplay = 0;
        }
        process_esp_state_machine();
    }
}