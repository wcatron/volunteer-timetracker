import * as React from 'react'
import { Link, browserHistory } from 'react-router'
import { Segment, Header, Image, Grid, Table, Modal, Icon, List, Input, Button, Container, Divider, Message, Dropdown} from 'semantic-ui-react'
var fetch = require('node-fetch');
var dateFormat = require('dateformat');
const querystring = require('querystring');
import DateTimePicker from 'react-datetime-picker';

class Result {
    name: string
    total: number
    isCheckedIn: boolean
}

export default class Totals extends React.Component<{
    selectedPerson: string,
    onLoad: () => void,
    onBack: () => void
}, {
    times: Array<{
        startTime: number
        endTime: number
        category: string
    }>
    loadingTimes: boolean,
    suggestCheckOut: boolean,
    suggestRemove?: number,
    editing: boolean,
    editingStartTime?: number
    editingType: 'end' | 'start' | 'category'
    editingNewDate?: Date
    editingNewCategory?: string
    categories: Array<{
        category: string,
        current: boolean
    }>
}> {
    constructor(props) {
        super(props)
        this.state = {
            loadingTimes: false,
            times:[],
            suggestCheckOut: false,
            suggestRemove: null,
            editing: false,
            editingStartTime: null,
            editingType: 'end',
            editingNewCategory: null,
            categories: []
        }
    }
    componentDidMount() {
        this.loadTimes(this.props.selectedPerson)
        this.loadCategories();
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.selectedPerson != nextProps.selectedPerson) {
            this.loadTimes(nextProps.selectedPerson);
        }
    }
    loadCategories() {
        fetch('/api/categories').then((results) => {
            return results.json();
        }).then((results) => {
            this.setState({
                categories: results
            })
        })
    }

    loadTimes(name) {
        this.setState({
            loadingTimes: true
        }, () => {
            fetch('/api/times?'+querystring.stringify({
                name: this.props.selectedPerson
            })).then((results) => {
                return results.json();
            }).then((results) => {
                this.setState({
                    times: results,
                    loadingTimes: false
                }, () => {
                    this.props.onLoad();
                })
            })
        })
    }

    checkOut() {
        fetch('/api/checkOut?'+querystring.stringify({
            name: this.props.selectedPerson,
            loadingTimes: true
        })).then((result) => {
            return result.json();
        }).then((result) => {
           this.loadTimes(this.props.selectedPerson)
        })
    }
    

    checkIn() {
        fetch('/api/checkIn?'+querystring.stringify({
            name: this.props.selectedPerson,
            loadingTimes: true
        })).then((result) => {
            return result.json();
        }).then((result) => {
           this.loadTimes(this.props.selectedPerson)
        })
    }

    remove(startTime) {
        fetch('/api/time?'+querystring.stringify({
            name: this.props.selectedPerson,
            type: 'remove',
            startTime: startTime
        }), {
            method: 'put'
        }).then((result) => {
            return result.json();
        }).then((result) => {
           this.loadTimes(this.props.selectedPerson)
        })
    }

    saveEdit() {
        fetch('/api/time?'+querystring.stringify({
            name: this.props.selectedPerson,
            type: this.state.editingType,
            startTime: this.state.editingStartTime,
            newValue: (this.state.editingType == 'category') ? this.state.editingNewCategory : (this.state.editingNewDate.getTime() / 1000)
        }), {
            method: 'put'
        }).then((result) => {
            return result.json();
        }).then((result) => {
           this.loadTimes(this.props.selectedPerson)
           this.setState({
               editing: false
           })
        })
    }

    render() {
        return (
            <div>
                <div><Button animated onClick={() => {
                   this.props.onBack();
                }}>
      <Button.Content visible>Back</Button.Content>
      <Button.Content hidden>
        <Icon name='arrow left' />
      </Button.Content>
    </Button> <Button onClick={() => {
        this.checkIn();
    }}>Check In</Button>
</div>
           <Table celled loading={this.state.loadingTimes}>
                    <Table.Header>
                        
                    <Table.Row>
                        <Table.HeaderCell>Day</Table.HeaderCell>
                        <Table.HeaderCell>Start Time</Table.HeaderCell>
                        <Table.HeaderCell>End Time</Table.HeaderCell>
                        <Table.HeaderCell>Category</Table.HeaderCell>
                        <Table.HeaderCell>Duration</Table.HeaderCell>
                    </Table.Row>
                    </Table.Header>

                    <Table.Body>
                    {this.state.times.sort((a,b) => { return b.startTime - a.startTime }).map((time) => {
                        
                     var startDate = new Date();
                     startDate.setTime(time.startTime * 1000);
                     var endDate = new Date();
                     var stillCheckedIn = true;
                     if (time.endTime) {
                        stillCheckedIn = false;
                        endDate.setTime(time.endTime * 1000);
                     }

                     var total = (endDate.getTime() - startDate.getTime()) / 1000;
                     var hours = Math.floor(total / (60 * 60))
                     var minutes = Math.round((total / 60) - (hours * 60))

                     if (this.state.editing && this.state.editingStartTime == time.startTime) {
                        return (
                            <Table.Row>
                                    <Table.Cell>{dateFormat(startDate,"m/d/yyyy")}</Table.Cell>
                                    <Table.Cell textAlign="center">{this.state.editingType == "start" ? <DateTimePicker
                                    onChange={(date) => {
                                        this.setState({
                                            editingNewDate: date
                                        })
                                    }}
                                    value={this.state.editingNewDate} isClockOpen={false}
                                    /> : dateFormat(startDate,"h:MMtt")}</Table.Cell>
                                    <Table.Cell textAlign="center">{this.state.editingType == "end" ? <DateTimePicker
                                    onChange={(date) => {
                                        this.setState({
                                            editingNewDate: date
                                        })
                                    }}
                                    value={this.state.editingNewDate} isClockOpen={false}
                                    /> : (stillCheckedIn ? '-' : dateFormat(endDate,"h:MMtt"))}</Table.Cell>

                                    <Table.Cell textAlign="center">{this.state.editingType == "category" ? <div>
                                    <Dropdown placeholder='Select Category' fluid onChange={(e, data) => {
                                        this.setState({
                                            editingNewCategory: data.value.toString()
                                        })
                                    }} options={this.state.categories.map((category, index) => {
                                        return {
                                            key: index,
                                            text: category.category,
                                            value: category.category
                                        }
                                    })} />
                                    </div> : (stillCheckedIn ? '-' : dateFormat(endDate,"h:MMtt"))}</Table.Cell>

                                    <Table.Cell><Button circular icon='check' onClick={() => {
                                        this.saveEdit();
                                    }} /> <Button circular icon='cancel' onClick={() => {
                                        this.setState({
                                            editing: false
                                        })
                                    }} /></Table.Cell>
                            </Table.Row>
                        )
                     }
                     
                    return ( <Table.Row key={time.startTime}>
                                <Table.Cell>{dateFormat(startDate,"m/d/yyyy")}</Table.Cell>
                                <Table.Cell selectable textAlign="center" onClick={() => {
                                    var date = new Date();
                                    date.setTime(time.startTime * 1000);
                                    this.setState({
                                        editing: true,
                                        editingStartTime: time.startTime,
                                        editingNewDate: date,
                                        editingType: 'start'
                                    })
                                }}>{dateFormat(startDate,"h:MMtt")}</Table.Cell>
                                <Table.Cell selectable textAlign="center"
                                onClick={() => {
                                    if (stillCheckedIn) {
                                        this.checkOut();
                                    } else {
                                        var date = new Date();
                                        date.setTime(time.endTime * 1000);
                                        this.setState({
                                            editing: true,
                                            editingStartTime: time.startTime,
                                            editingNewDate: date,
                                            editingType: 'end'
                                        })
                                    }
                                }} onMouseOver={() => {
                                    if (stillCheckedIn) {
                                        this.setState({
                                            suggestCheckOut: true
                                        })
                                    }
                                }} onMouseOut={() => {
                                    if (stillCheckedIn) {
                                        this.setState({
                                            suggestCheckOut: false
                                        })
                                    }
                                }}>{stillCheckedIn ? (this.state.suggestCheckOut ? 'Check Out' : '-') : dateFormat(endDate,"h:MMtt")}</Table.Cell>
                                <Table.Cell selectable textAlign="center" onClick={() =>{
                                    this.setState({
                                        editing: true,
                                        editingStartTime: time.startTime,
                                        editingType: 'category'
                                    })
                                }}>{time.category}</Table.Cell>
                                <Table.Cell style={{paddingLeft: 11}} selectable textAlign="left" onMouseOver={() => {
                                    this.setState({
                                        suggestRemove: time.startTime
                                    })
                                }} onMouseOut={() => {
                                    if (this.state.suggestRemove == time.startTime) {
                                        this.setState({
                                            suggestRemove: null
                                        })
                                    }
                                }} onClick={() => {
                                    if (window.confirm("Are you sure you want to remove this entry?")) { 
                                        this.remove(time.startTime)
                                    }
                                }}>{this.state.suggestRemove == time.startTime ? 'Remove' : `${hours}h ${minutes}m`}</Table.Cell>
                        </Table.Row>)
                 })}
                   
                        </Table.Body>
                        </Table>    
                        </div>                    
        )
    }
}
