import React from 'react';
import { Line } from 'react-chartjs-2';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import moment from 'moment';

const styles = theme => ({
	root: {
		flexGrow: 1,
	},
	paper: {
		padding: theme.spacing.unit * 2,
		textAlign: 'left',
		color: theme.palette.text.secondary,
	},
	// title: {
	// 	paddingTop: theme.spacing.unit * 2,
	// 	paddingBottom: theme.spacing.unit * 2,
	// }
});

class DataChart extends React.Component {

	render() {

		const classes = this.props.classes;

		const data = {
			labels: this.props.labels,
			datasets: this.props.datasets
		};

		const options = {
			scales: {
				xAxes: [{
					type: 'time',
					distribution: 'series',
					ticks: {
						source: 'auto',
						fontFamily: "Roboto"
					},
					time: {
						displayFormats: {
							day: 'DD-MM-YYYY'
						},
						stepSize: 10,
						unit: 'month'
					}
				}],
				yAxes: [{
					ticks: {
						callback: function (value, index, values) {
							return value + '%';
						},
						fontFamily: "Roboto"
					}
				}]
			},
			title: {
				display: false,
				text: "Click on the legend to show/hide an instrument.",
				fontFamily: "Roboto"
			},
			legend: {
				display: false,
				position: 'right',
				labels: {
					fontFamily: "Roboto"
				}
			},
			animation: {
				duration: 0, // general animation time
			},
			hover: {
				animationDuration: 0, // duration of animations when hovering an item
			},
			responsiveAnimationDuration: 0, // animation duration after a resize
			tooltips: {
				callbacks: {
					title: (tooltipItem) => {
						
						return moment(tooltipItem[0].xLabel, this.props.dateFormat, true).format(this.props.displayDateFormat);

					},
					label: function (tooltipItem, data) {

						var label = data.datasets[tooltipItem.datasetIndex].label || '';

						if (label) {
							label += ': ';
						}
						label += Math.round(tooltipItem.yLabel * 100) / 100 + "%";
						return label;

					}
				}
			}
		}

		return (

			<Paper className={classes.paper}>
				<Grid item>
					<Line data={data} options={options} />
				</Grid>
			</Paper>

		)
	};

}

DataChart.propTypes = {
	datasets: PropTypes.array.isRequired,
	labels: PropTypes.array.isRequired,
	dateFormat: PropTypes.string,
	displayDateFormat: PropTypes.string
};

DataChart.defaultProps = {
	dateFormat: 'YYYY-MM-DD',
	displayDateFormat: 'dddd, MMMM Do YYYY',
}

export default withStyles(styles)(DataChart);