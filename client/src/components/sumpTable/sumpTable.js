import React from 'react';
import './sumpTable.css';

const SumpTable = ({ sumpRecords = [] }) => {
    return (
	<div className="sumpTableContainer">
            <table className="sumpTable">
                <thead className="sumpTableHeader">
                    <tr className="sumpTableHeaderRow">
                        <th className="sumpTableHeaderCell"></th>
                        <th className="sumpTableHeaderCell">TIME</th>
                        <th className="sumpTableHeaderCell">High ADC</th>
                        <th className="sumpTableHeaderCell">Low ADC</th>
                        <th className="sumpTableHeaderCell">On Time</th>
                        <th className="sumpTableHeaderCell">Off Time</th>
                        <th className="sumpTableHeaderCell">Hours ON</th>
    		            <th className="sumpTableHeaderCell">Duty Cycle</th> 
                    </tr>
                    <tr className="sumpTableHeaderRow">
                        <th className="sumpTableHeaderCell">MAX</th>
                        <th className="sumpTableHeaderCell">{stats.datetime.max}</th>
                        <th className="sumpTableHeaderCell">{stats.Hadc.max}</th>
                        <th className="sumpTableHeaderCell">{stats.Ladc.max}</th>
                        <th className="sumpTableHeaderCell">{stats.timeOn.max}</th>
                        <th className="sumpTableHeaderCell">{stats.timeOff.max}</th>
                        <th className="sumpTableHeaderCell">{stats.hoursOn.max}</th>
    		            <th className="sumpTableHeaderCell">{stats.duty.max}</th> 
                    </tr>
                    <tr className="sumpTableHeaderRow">
                        <th className="sumpTableHeaderCell">AVG</th>
                        <th className="sumpTableHeaderCell">{stats.datetime.avg}</th>
                        <th className="sumpTableHeaderCell">{stats.Hadc.avg}</th>
                        <th className="sumpTableHeaderCell">{stats.Ladc.avg}</th>
                        <th className="sumpTableHeaderCell">{stats.timeOn.avg}</th>
                        <th className="sumpTableHeaderCell">{stats.timeOff.avg}</th>
                        <th className="sumpTableHeaderCell">{stats.hoursOn.avg}</th>
    		            <th className="sumpTableHeaderCell">{stats.duty.avg}</th> 
                    </tr>
                    <tr className="sumpTableHeaderRow">
                        <th className="sumpTableHeaderCell">MIN</th>
                        <th className="sumpTableHeaderCell">{stats.datetime.min}</th>
                        <th className="sumpTableHeaderCell">{stats.Hadc.min}</th>
                        <th className="sumpTableHeaderCell">{stats.Ladc.min}</th>
                        <th className="sumpTableHeaderCell">{stats.timeOn.min}</th>
                        <th className="sumpTableHeaderCell">{stats.timeOff.min}</th>
                        <th className="sumpTableHeaderCell">{stats.hoursOn.min}</th>
    		            <th className="sumpTableHeaderCell">{stats.duty.min}</th>  
                    </tr>
                </thead>
                <tbody className="sumpTableBody">
                    <tr className="sumpTableRowPlaceHolderControlBar"></tr>
                    {Array.isArray(sumpRecords) && sumpRecords.map((record) => (
                        <tr key={record.id} className="sumpTableRow">
                            <td className="sumpTableCell">{record.payload?.datetime ? record.payload.datetime.split(' ')[1] : "N/a"}</td>
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
