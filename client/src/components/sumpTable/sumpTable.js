import React from 'react';
import './sumpTable.css';

const SumpTable = ({ sumpRecords = [] }) => {
    return (
	<div className="sumpTableContainer">
            <table className="sumpTable">
                <thead className="sumpTableHeader">
                    <tr className="sumpTableHeaderRow">
                        <th className="sumpTableHeaderCell">TIME</th>
                        <th className="sumpTableHeaderCell">High ADC</th>
                        <th className="sumpTableHeaderCell">Low ADC</th>
                        <th className="sumpTableHeaderCell">On Time</th>
                        <th className="sumpTableHeaderCell">Off Time</th>
                        <th className="sumpTableHeaderCell">Hours ON</th>
    		        <th className="sumpTableHeaderCell">Duty Cycle</th> 
                    </tr>
                </thead>
                <tbody className="sumpTableBody">
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
