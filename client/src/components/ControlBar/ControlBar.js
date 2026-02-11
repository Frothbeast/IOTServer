import SumpChart from '../sumpChart';
import './ControlBar.css';

const ControlBar = ({ selectedHours, onHoursChange, columnStats, sumpRecords, toggleSidebar, isSidebarOpen }) => {
  const getOptions = (min, max) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    layout: {
      padding: 0
    },
    scales: {
      x: {
        display: false,
        reverse: true
      },
      y: {
        display: false,
        min: min,
        max: max
      }
    },
    elements: {
      point: {
        radius: 0
      }
    }
  });

  return (
    <header className="controlBar">
      <div className="brand">Sump</div>
      <div className="centerSection">
        <select className="selectedHours" value={selectedHours} onChange={(e) => onHoursChange(Number(e.target.value))}>
          <option value={1}>Hour</option>
          <option value={24}>Day</option>
          <option value={168}>Week</option>
        </select>
        <div className="buttonRow">
            <div className="lastRun">Last Run: {columnStats?.lastDatetime ?? "N/a"}</div>
            <button className="sidebarButton" onClick={toggleSidebar}>
                {isSidebarOpen ? "Close Chart" : "View Graph"}
            </button>
        </div>
      </div>
      <div className="chartSection">
        <div className="chartContainer1">
          <div className="chart-watermark">ADC</div>
          <SumpChart
            labels={sumpRecords.map((_, i) => i)}
            datasets={[
              {
                label: "Ladc",
                color: "pink",
                data: sumpRecords.map(r => r.payload?.Ladc),
              },
              {
                label: "Hadc",
                color: "green",
                data: sumpRecords.map(r => r.payload?.Hadc),
              }
            ]}
            options={getOptions(400, 1024)}
          />
        </div>
        <div className="chartContainer2">
          <div className="chart-watermark">TIME</div>
          <SumpChart
            labels={sumpRecords.map((_, i) => i)}
            datasets={[
              {
                label: "timeOn",
                color: "yellow",
                data: sumpRecords.map(r => r.payload?.timeOn),
              },
              {
                label: "timeOff",
                color: "red",
                data: sumpRecords.map(r => r.payload?.timeOff),
              }
            ]}
            options={getOptions(0, 1000)}
          />
        </div>
        <div className="chartContainer3">
          <div className="chart-watermark">DUTY</div>
          <SumpChart
            labels={sumpRecords.map((_, i) => i)}
            datasets={[
              {
                label: "duty",
                color: "green",
                data: sumpRecords.map(r => r.payload?.duty)
              }
            ]}
            options={getOptions(0, 100)}
          />
        </div>
        <div className="chartContainer4">
          <div className="chart-watermark">PERIOD</div>
          <SumpChart
            labels={sumpRecords.map((_, i) => i)}
            datasets={[{
              label: "period",color: "red",
              data: sumpRecords.slice(1).map((r, i) => {
                const current = new Date(r.payload?.datetime).getTime();
                const previous = new Date(sumpRecords[i].payload?.datetime).getTime();
                return ( previous -current) / 60000;
              })}
            ]}
            options={getOptions(0, 100)}
          />
        </div>
      </div>
    </header>
  );
};

export default ControlBar;