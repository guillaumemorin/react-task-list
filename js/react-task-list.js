var React = require('react');
var socket = io('http://localhost');

var tasks = [
	{
		id: 1,
		title: 'task 1'
	},
	{
		id: 2,
		title: 'task 2'
	},
	{
		id: 3,
		title: 'task 3'
	}
];

var List = React.createClass({

	getInitialState: function() {
		return {
			on_edit_id: null,
			on_edit_value: null,
			tasks: this.props.tasks
		};
	},

	componentDidMount: function() {

		window.addEventListener("mousedown", this._pageClick, false);

		socket.on('edit', function (i) {

			var tasks = this.state.tasks;
			tasks[i].disabled = true;
			this.setState({tasks: tasks});

		}.bind(this));

		socket.on('value', function (data) {

			var tasks = this.state.tasks;
			tasks[data.id].title = data.value;

			this.setState({tasks: tasks})
		}.bind(this));

		socket.on('validate', function (i) {

			var tasks = this.state.tasks;
			tasks[i].disabled = false;

			this.setState({tasks: tasks});

		}.bind(this));
	},

	render: function() {
		var rows = [];

		this.state.tasks.forEach(function(task, i) {
			var row = [<div className="task_label" id={'task_' + i} onDoubleClick={this._edit.bind(null, i)}>{task.title}</div>]

			if (this.state.tasks[i].disabled) {
				var message = 'Somebody else is modifying this field, please wait...';
				row = [
					<input className="disabled" id={'task_' + i} type="text" value={this.state.tasks[i].title} disabled="disable" />,
					<span className="text-warning">{message}</span>
				]
			}

			if (i === this.state.on_edit_id) {
				row = [<input className="edited" id={'task_' + i} ref={'input_' + i} type="text" onfocus="this.value = this.value;" value={this.state.on_edit_value} onChange={this._handleChange} />]
			}

			row.push(<i className="mdi-maps-local-post-office"></i>)

			rows.push(
				<li key={'label_' + i}>
					{row}
				</li>
			);
		}.bind(this));

		return (
			<div>
				<ul>
					{rows}
				</ul>
			</div>
		)
	},

	_pageClick: function(event) {
		var target_id = event.target.id || null;
		if (this.state.on_edit_id !== null && 'task_' + this.state.on_edit_id !== target_id) {
			this._validate();
		}
	},

	_edit: function(i) {
		this.setState({on_edit_id: i, on_edit_value: this.state.tasks[i].title}, function() {
			this.refs['input_' + i].getDOMNode().focus();
		}.bind(this));
		socket.emit('edit', i);
	},

	_validate: function(i) {
		var tasks = this.state.tasks;
		tasks[this.state.on_edit_id].title = this.state.on_edit_value;
		socket.emit('validate', this.state.on_edit_id);
		this.setState({
			on_edit_id: null,
			tasks: tasks
		});
	},

	_handleChange: function(event) {
		this.setState({on_edit_value: event.target.value});
		socket.emit('value', {id: this.state.on_edit_id, value: event.target.value});
	}
});

React.render(
	<div className="container">
		<div className="row">
			<h1 className="text-primary">Tasks</h1>
		</div>
		<div className="row">
			<div id="panel-container">
				<div className="panel panel-default">
					<div className="panel-body">
						<List tasks={tasks} />
					</div>
				</div>
			</div>
		</div>
	</div>,
	document.getElementById('hello')
);