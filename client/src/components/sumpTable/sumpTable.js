import React from 'react';
import './sumpTable.css';

const SumpTable = ({ sumpRecords = [], columnStats }) => {
    if (!columnStats) return null;

    return (
	<div className="sumpTableContainer">
            <table className="sumpTable">
                <thead className="sumpTableHeader">
                    <tr className="sumpTableHeaderRow">
                        <th className="sumpTableHeaderCell1"></th>
                        <th className="sumpTableHeaderCell" style={{ fontSize: "1vw" }}>TIME</th>
                        <th className="sumpTableHeaderCell" style={{ fontSize: "1vw" }}>High</th>
                        <th className="sumpTableHeaderCell" style={{ fontSize: "1vw" }}>Low</th>
                        <th className="sumpTableHeaderCell" style={{ fontSize: "1vw" }}>On</th>
                        <th className="sumpTableHeaderCell" style={{ fontSize: "1vw" }}>Off</th>
                        <th className="sumpTableHeaderCell" style={{ fontSize: "1vw" }}>Hours</th>
                        <th className="sumpTableHeaderCell" style={{ fontSize: "1vw" }}>Duty</th> 
                    </tr>
                    <tr className="sumpTableHeaderRow">
                        <th className="sumpTableHeaderCell1">MAX</th>
                        <th className="sumpTableHeaderCell">{columnStats.datetime.max}</th>
                        <th className="sumpTableHeaderCell">{columnStats.Hadc.max}</th>
                        <th className="sumpTableHeaderCell">{columnStats.Ladc.max}</th>
                        <th className="sumpTableHeaderCell">{columnStats.timeOn.max}</th>
                        <th className="sumpTableHeaderCell">{columnStats.timeOff.max}</th>
                        <th className="sumpTableHeaderCell">{columnStats.hoursOn.max}</th>
    		            <th className="sumpTableHeaderCell">{columnStats.duty.max}</th> 
                    </tr>
                    <tr className="sumpTableHeaderRow">
                        <th className="sumpTableHeaderCell1">AVG</th>
                        <th className="sumpTableHeaderCell">{columnStats.datetime.avg}</th>
                        <th className="sumpTableHeaderCell">{columnStats.Hadc.avg}</th>
                        <th className="sumpTableHeaderCell">{columnStats.Ladc.avg}</th>
                        <th className="sumpTableHeaderCell">{columnStats.timeOn.avg}</th>
                        <th className="sumpTableHeaderCell">{columnStats.timeOff.avg}</th>
                        <th className="sumpTableHeaderCell">{columnStats.hoursOn.avg}</th>
    		            <th className="sumpTableHeaderCell">{columnStats.duty.avg}</th> 
                    </tr>
                    <tr className="sumpTableHeaderRow">
                        <th className="sumpTableHeaderCell1">MIN</th>
                        <th className="sumpTableHeaderCell">{columnStats.datetime.min}</th>
                        <th className="sumpTableHeaderCell">{columnStats.Hadc.min}</th>
                        <th className="sumpTableHeaderCell">{columnStats.Ladc.min}</th>
                        <th className="sumpTableHeaderCell">{columnStats.timeOn.min}</th>
                        <th className="sumpTableHeaderCell">{columnStats.timeOff.min}</th>
                        <th className="sumpTableHeaderCell">{columnStats.hoursOn.min}</th>
    		            <th className="sumpTableHeaderCell">{columnStats.duty.min}</th>  
                    </tr>
                </thead>
                <tbody className="sumpTableBody">
                    <tr className="sumpTableRowPlaceHolderControlBar"></tr>
                    {Array.isArray(sumpRecords) && sumpRecords.map((record) => (
                        <tr key={record.id} className="sumpTableRow">
                            <td className="sumpTableCell1"></td>
                            <td className="sumpTableCell"style={{ width: '11vw' }}>{record.payload?.datetime ? record.payload.datetime.split(' ')[1] : "N/a"}</td>
                            <td className="sumpTableCell">{record.payload?.Hadc ?? "N/a"}</td>
			                <td className="sumpTableCell">{record.payload?.Ladc ?? "N/a"}</td>
                            <td className="sumpTableCell">{record.payload?.timeOn ?? "N/a"}</td>
                            <td className="sumpTableCell">{record.payload?.timeOff ?? "N/a"}</td>
                            <td className="sumpTableCell">{record.payload?.hoursOn ?? "N/a"}</td>
			                <td className="sumpTableCell">{record.payload?.duty ?? "N/a"}</td>
                        </tr>
                    ))}
                </tbody>
	    </table>
	</div>
    );
};

export default SumpTable;
