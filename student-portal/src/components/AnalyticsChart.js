import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
ChartJS.register(...registerables);

const AnalyticsChart = ({ marksData, attendanceData }) => {
  const barData = {
    labels: marksData.map(d => d.subject),
    datasets: [{
      label: 'Marks Secured',
      data: marksData.map(d => d.marks),
      backgroundColor: '#3498db'
    }]
  };

  const pieData = {
    labels: ['Attended', 'Missed'],
    datasets: [{
      data: [attendanceData, 100 - attendanceData],
      backgroundColor: ['#2ecc71', '#e74c3c']
    }]
  };

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      <div style={{ width: '400px' }}><h3>Subject Marks</h3><Bar data={barData} /></div>
      <div style={{ width: '300px' }}><h3>Total Attendance %</h3><Pie data={pieData} /></div>
    </div>
  );
};