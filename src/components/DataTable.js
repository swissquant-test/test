import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import TablePagination from '@material-ui/core/TablePagination';

const styles = theme => ({
	root: {
		width: '100%',
		marginTop: theme.spacing.unit * 2,
		overflowX: 'auto',
	},
	table: {
		minWidth: 700,
	},
	cell: {
		fontSize: 10
	},
	tableHeader: {
		fontSize: 10,
		fontWeight: 'bold',
	}
});

class DataTable extends React.Component {

	constructor(props) {

		super(props);

		this.state = {
			page: 0,
			rowsPerPage: 5
		}

		this.handleChangePage = this.handleChangePage.bind(this);
		this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this);

	}

	handleChangePage = (event, page) => {
		this.setState({ page });
	};

	handleChangeRowsPerPage = event => {
		this.setState({ rowsPerPage: event.target.value });
	};

	render() {

		const { classes } = this.props;

		const rows = [];
		const rowsPerPage = this.state.rowsPerPage;
		const page = this.state.page;

		const offset = page * rowsPerPage;

		for (let rowIndex = offset; rowIndex < offset + rowsPerPage; rowIndex++) {

			const row = this.props.rows[rowIndex];

			if (row) {

				const cells = row.map(function (cell, cellIndex) {

					const component = cellIndex === 0 ? "th" : "td";
					const className = cellIndex === 0 ? classes.tableHeader : classes.cell
	
					return (
						<TableCell className={className} key={cellIndex} component={component} scope="row">
							{cell}
						</TableCell>
					)
				})
	
				rows.push(
					<TableRow key={rowIndex}>
						{cells}
					</TableRow>
				);
				
			}

		}

		const labels = this.props.labels.map(function (label, index) {
			return <TableCell className={classes.cell} key={index}>{label}</TableCell>
		});

		return (
			<Paper className={classes.root}>
				<Table className={classes.table}>
					<TableHead>
						<TableRow>
							{labels}
						</TableRow>
					</TableHead>
					<TableBody>
						{rows}
					</TableBody>
				</Table>
				<TablePagination
					rowsPerPageOptions={[5, 10, 25]}
					component="div"
					count={this.props.rows.length}
					rowsPerPage={rowsPerPage}
					page={page}
					backIconButtonProps={{
						'aria-label': 'Previous Page',
					}}
					nextIconButtonProps={{
						'aria-label': 'Next Page',
					}}
					onChangePage={this.handleChangePage}
					onChangeRowsPerPage={this.handleChangeRowsPerPage}
				/>
			</Paper>
		);
	}
}

DataTable.propTypes = {
	classes: PropTypes.object.isRequired,
	rows: PropTypes.array.isRequired,
	labels: PropTypes.array
};

DataTable.defaultProps = {
	rows: [],
	labels: []
}

export default withStyles(styles)(DataTable);