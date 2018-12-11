import React from 'react';
import DataTable from './components/DataTable.js';
import DataChart from './components/DataChart.js';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import moment from 'moment';
import palette from 'google-palette';
import rawData from './data/mktdata.json';
import Typography from '@material-ui/core/Typography';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import { MuiPickersUtilsProvider } from 'material-ui-pickers';
import { DatePicker } from 'material-ui-pickers';
import MomentUtils from '@date-io/moment';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Drawer from '@material-ui/core/Drawer';
import PropTypes from 'prop-types';

const dateFormat = "YYYY-MM-DD";			// The date format of the external data
const displayDateFormat = "DD-MM-YYYY";		// The date format used in the application
const drawerWidth = 250;

const styles = theme => ({
	root: {
		flexGrow: 1
	},
	title: {
		paddingTop: theme.spacing.unit * 2,
		paddingBottom: theme.spacing.unit * 2,
	},
	textField: {
		marginRight: theme.spacing.unit,
		width: "45%",
	},
	legend: {
		marginTop: theme.spacing.unit * 4,
	},
	formGroup: {
		marginTop: theme.spacing.unit * 1,
	},
	appBar: {
		marginBottom: theme.spacing.unit,
		zIndex: theme.zIndex.drawer + 1,
	},
	drawer: {
		width: drawerWidth,
		flexShrink: 0,
	},
	drawerPaper: {
		width: drawerWidth,
		paddingLeft: theme.spacing.unit * 3,
		paddingRight: theme.spacing.unit * 3,
		marginTop: 56,
		[`${theme.breakpoints.up('xs')} and (orientation: landscape)`]: {
			marginTop: 48,
		},
		[theme.breakpoints.up('sm')]: {
			marginTop: 64,
		},
	},
	content: {
		marginTop: 56,
		[`${theme.breakpoints.up('xs')} and (orientation: landscape)`]: {
			marginTop: 48,
		},
		[theme.breakpoints.up('sm')]: {
			marginTop: 64,
		},
		flexGrow: 1,
		paddingTop: theme.spacing.unit * 2,
		paddingBottom: theme.spacing.unit * 2,
		paddingLeft: theme.spacing.unit,
		paddingRight: theme.spacing.unit,
		width: `calc(100% - ${drawerWidth}px - ${(theme.spacing.unit * 3) * 2}px - ${(theme.spacing.unit) * 2}px)`,
		marginLeft: drawerWidth + (theme.spacing.unit * 3) * 2,
	},
	toolbar: theme.mixins.toolbar,

});

/*************************************************************************
 * On mobile, the Filters panel should be implemented as a swipeable drawer.
 * Example: https://material-ui.com/demos/drawers/#temporary-drawer
 *************************************************************************/
class App extends React.Component {

	constructor(props) {

		super(props);

		this.state = {
			rows: [],
			labels: [],
			dates: [],
			chartData: [],
			chartLabels: [],
			shownInstruments: {},
			minDate: moment(),
			maxDate: moment(),
			isDrawerOpen: true,
			minValue: Infinity,
			maxValue: -Infinity
		}

		this.colors = palette('tol', rawData.mktData.length).map(function (hex) {
			return '#' + hex;
		})

		this.minDate = moment();
		this.maxDate = moment();

		this.updateData = this.updateData.bind(this);
		this.mapData = this.mapData.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleMinDateChange = this.handleMinDateChange.bind(this);
		this.handleMaxDateChange = this.handleMaxDateChange.bind(this);
		this.handleMinValueChange = this.handleMinValueChange.bind(this);
		this.handleMaxValueChange = this.handleMaxValueChange.bind(this);

	}

	componentDidMount() {

		this.updateData(true);

	}

	updateData(init = false) {

		this.data = this.mapData(rawData, init);

		if (init) {

			const minDateString = rawData.mktData[0].timeSeries.entries[0].d;
			const maxDateString = rawData.mktData[0].timeSeries.entries[rawData.mktData[0].timeSeries.entries.length - 1].d;

			this.minDate = moment(minDateString, dateFormat, true);
			this.maxDate = moment(maxDateString, dateFormat, true);

			this.setState({
				minValue: this.data.minValue,
				maxValue: this.data.maxValue,
				minDate: this.minDate,
				maxDate: this.maxDate
			});

		}

		this.setState({
			rows: this.data.rows,
			labels: this.data.labels,
			dates: this.data.dates,
			chartData: this.data.chartData,
			chartLabels: this.data.chartLabels,
			shownInstruments: this.data.shownInstruments
		});

	}

	handleChange = instrumentId => event => {

		const shownInstruments = Object.assign({}, this.state.shownInstruments);

		shownInstruments[instrumentId] = !shownInstruments[instrumentId];

		this.setState({
			shownInstruments: shownInstruments
		}, () => {
			this.updateData();
		})

	};

	handleMinDateChange = date => {

		this.setState({
			minDate: date
		}, () => {
			this.updateData();
		})

	};

	handleMaxDateChange = date => {

		this.setState({
			maxDate: date
		}, () => {
			this.updateData();
		})

	};

	handleMinValueChange = event => {

		this.setState({
			minValue: event.target.value
		}, () => {
			this.updateData();
		})

	};

	handleMaxValueChange = event => {

		this.setState({
			maxValue: event.target.value
		}, () => {
			this.updateData();
		})

	};

	toggleDrawer = (open) => () => {
		this.setState({
			isDrawerOpen: open,
		});
	};

	/*********************************************************************************************
	 * Further optimization might be performed using different data structures, in order to avoid
	 * iterations when an instrument is hide/displayed
	 ********************************************************************************************/
	mapData(rawData, init = false) {

		const rows = [];
		const labels = ["Date"];
		const dates = [];
		const chartData = [];
		let chartLabels = [];
		const shownInstruments = {};
		let minValue = Infinity;
		let maxValue = -Infinity;

		rawData.mktData.forEach((instrument, instrumentIndex) => {

			shownInstruments[instrument.instrumentId] = init ? true : this.state.shownInstruments[instrument.instrumentId];

			if (init || this.state.shownInstruments[instrument.instrumentId]) {

				chartData.push({
					instrumentId: instrument.instrumentId,
					label: `Instrument ${instrument.instrumentId}`,
					hidden: !init && !this.state.shownInstruments[instrument.instrumentId],
					data: [],
					fill: false,
					backgroundColor: this.colors[instrumentIndex],
					borderColor: this.colors[instrumentIndex],
					borderCapStyle: 'butt',
					borderDash: [],
					borderDashOffset: 0.0,
					borderJoinStyle: 'miter',
					pointBorderColor: this.colors[instrumentIndex],
					pointBackgroundColor: '#fff',
					pointBorderWidth: 1,
					pointHoverRadius: 5,
					pointHoverBackgroundColor: this.colors[instrumentIndex],
					pointHoverBorderColor: 'rgba(220,220,220,1)',
					pointHoverBorderWidth: 2,
					pointRadius: 1,
					pointHitRadius: 10,
				});

				chartLabels = [];

				labels.push(`Instrument ${instrument.instrumentId}`);

				let offset = 0;

				instrument.timeSeries.entries.every((entry) => {

					const entryDate = moment(entry.d, dateFormat);

					if (!init && this.state.minDate && entryDate.isBefore(this.state.minDate)) {
						return true;
					}

					if (!init && this.state.maxDate && entryDate.isAfter(this.state.maxDate)) {
						return false;
					}

					// Populating the dates array
					if (dates.length < instrument.timeSeries.entries.length) {
						dates.push(entryDate);
					}

					rows[offset] = rows[offset] || [];
					rows[offset][0] = entryDate.format(displayDateFormat);

					if (init) {
						minValue = Math.min(minValue, entry.v);
						maxValue = Math.max(maxValue, entry.v);
					}

					let entryValue = entry.v;

					if (!init && (entryValue < this.state.minValue || entryValue > this.state.maxValue)) {

						entryValue = null;

					}

					rows[offset][instrumentIndex + 1] = entryValue;

					/****************************************************************************
					 * Data decimation to improve the chart performance.
					 * Ideally, we should calculate the width of the chart, and send to the chart
					 * component the same number of points to draw.
					 ***************************************************************************/
					if (offset % 4 === 0) {

						const baseValue = instrument.timeSeries.entries[0].v;

						if (entryValue === null) {
							chartData[chartData.length - 1].data.push(null);
						} else {
							chartData[chartData.length - 1].data.push(entryValue * 100 / baseValue);
						}

						chartLabels.push(entry.d);

					}

					offset++;

					return true;

				})

			}

		});

		return { rows, labels, dates, chartData, chartLabels, shownInstruments, minValue, maxValue };

	}

	render() {

		const { classes } = this.props;
		const rows = this.state.rows;
		const labels = this.state.labels;
		const datasets = this.state.chartData;

		const instrumentsDisplayControls = [];

		Object.keys(this.state.shownInstruments).forEach((instrumentId, instrumentIndex) => {

			const isVisible = this.state.shownInstruments[instrumentId];

			instrumentsDisplayControls.push(
				<FormControlLabel
					key={instrumentId}
					control={
						<Checkbox
							checked={isVisible}
							onChange={this.handleChange(instrumentId)}
							value={'' + instrumentId}
							style={{
								"color": this.colors[instrumentIndex]
							}}
						/>
					}
					label={"Instrument " + instrumentId}
				/>
			)

		});

		return (
			<MuiPickersUtilsProvider utils={MomentUtils} >
				<div className={classes.root}>
					<AppBar position="fixed" className={classes.appBar}>
						<Toolbar className={classes.toolbar}>
							<Typography variant="h6" color="inherit" className={classes.title}>
								Market Data
							  </Typography>
						</Toolbar>
					</AppBar>
					<Drawer
						className={classes.drawer}
						variant="permanent"
						classes={{
							paper: classes.drawerPaper,
						}}
						anchor="left"
					>
						<Typography className={classes.title} variant="h6">
							Filters
						</Typography>
						<FormControl component="fieldset" className={classes.formControl}>

							<FormLabel className={classes.legend} component="legend">Date range</FormLabel>
							<Grid container>
								<DatePicker label="Min" minDate={this.minDate.toDate()} maxDate={this.state.maxDate.toDate()} format={displayDateFormat} margin="normal" placeholder="Min" className={classes.textField} value={this.state.minDate} onChange={this.handleMinDateChange} />
								<DatePicker label="Max" minDate={this.state.minDate.toDate()} maxDate={this.maxDate.toDate()} format={displayDateFormat} margin="normal" placeholder="Max" className={classes.textField} value={this.state.maxDate} onChange={this.handleMaxDateChange} />
							</Grid>

							<FormLabel className={classes.legend} component="legend">Value range</FormLabel>
							<Grid container>
								<TextField
									label="Min"
									placeholder="Min"
									value={this.state.minValue}
									onChange={this.handleMinValueChange}
									type="number"
									className={classes.textField}
									InputLabelProps={{
										shrink: true,
									}}
									margin="normal"
								/>
								<TextField
									label="Max"
									placeholder="Max"
									value={this.state.maxValue}
									onChange={this.handleMaxValueChange}
									type="number"
									className={classes.textField}
									InputLabelProps={{
										shrink: true,
									}}
									margin="normal"
								/>
							</Grid>

							<FormLabel className={classes.legend} component="legend">Show/Hide Instruments</FormLabel>
							<FormGroup className={classes.formGroup}>
								{instrumentsDisplayControls}
							</FormGroup>
						</FormControl>
					</Drawer>
					<main className={classes.content}>
						<DataChart labels={this.state.chartLabels} datasets={datasets} />
						<DataTable labels={labels} rows={rows} />
					</main>
				</div>
			</MuiPickersUtilsProvider>
		)

	}

}

App.propTypes = {
	classes: PropTypes.object.isRequired,
	theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(App);