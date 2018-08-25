import * as React from 'react'
import { Link, browserHistory } from 'react-router'
import { Segment, Header, Image, Grid, Table, Icon, List, Input, Button, Container, Divider, Message} from 'semantic-ui-react'
var fetch = require('node-fetch');
var dateFormat = require('dateformat');
const querystring = require('querystring');

class Result {
    name: string
    total: number
    isCheckedIn: boolean
}

export default class Totals extends React.Component<{}, {
    results: Array<Result>
    loading: boolean
    selectedPerson: string
    times: Array<{
        startTime: number
        endTime: number
    }>
    loadingTimes: boolean
}> {
    constructor(props) {
        super(props)
        this.state = {
            results: [],
            loading: false,
            selectedPerson: "",
            loadingTimes: false,
            times:[]
        }
    }
    componentDidMount() {
        this.loadResults()
    }
    loadResults() {
        fetch('/api/totals').then((results) => {
            return results.json();
        }).then((results) => {
            this.setState({
                results,
                loading: false
            })
        })
    }

    loadTimes(name) {
        this.setState({
            selectedPerson: name,
            loadingTimes: true
        }, () => {
            fetch('/api/times?'+querystring.stringify({
                name: this.state.selectedPerson
            })).then((results) => {
                return results.json();
            }).then((results) => {
                this.setState({
                    times: results,
                    loadingTimes: false
                })
            })
        })
    }
    
    render() {
        return (
            <div>
                <Header textAlign="center">Volunteer Check-in and Check-out Totals</Header>
                <Button as={Link} {...{to:'/'}} content={"Back to Check In"} /> <Button content='Refresh' loading={this.state.loading} onClick={() => {
                    this.loadResults()
                }}/>
                <Table celled selectable>
                    <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Hours</Table.HeaderCell>
                        <Table.HeaderCell>Minutes</Table.HeaderCell>
                    </Table.Row>
                    </Table.Header>

                    <Table.Body>
                    {this.state.results.sort((a,b) => { return b.total - a.total }).map((person: Result) => {
                     var hours = Math.floor(person.total / (60 * 60))
                     var minutes = Math.round((person.total / 60) - (hours * 60))
                    return ( <Table.Row onClick={() => {
                        this.loadTimes(person.name)
                    }}>
                                <Table.Cell>{person.name} {person.isCheckedIn ? <Icon name="calendar check" /> : null }</Table.Cell>
                                <Table.Cell>{hours}</Table.Cell>
                                <Table.Cell>{minutes}</Table.Cell>

                        </Table.Row>)
                 })}
                   
                        </Table.Body>
                        </Table>
                        <Header textAlign="center" sub>{this.state.selectedPerson}</Header>
                        <Table celled selectable loading={this.state.loadingTimes}>
                    <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Day</Table.HeaderCell>
                        <Table.HeaderCell>Start Time</Table.HeaderCell>
                        <Table.HeaderCell>End Time</Table.HeaderCell>
                        <Table.HeaderCell>Duration</Table.HeaderCell>
                    </Table.Row>
                    </Table.Header>

                    <Table.Body>
                    {this.state.times.sort((a,b) => { return b.startTime - a.startTime }).map((time) => {
                        var total = time.endTime - time.startTime;
                     var hours = Math.floor(total / (60 * 60))
                     var minutes = Math.round((total / 60) - (hours * 60))
                     var startDate = new Date();
                     startDate.setTime(time.startTime * 1000);
                     var endDate = new Date();
                     endDate.setTime(time.endTime * 1000);
                     
                    return ( <Table.Row>
                                <Table.Cell>{dateFormat(startDate,"m/d/yyyy")}</Table.Cell>
                                <Table.Cell>{dateFormat(startDate,"h:MMtt")}</Table.Cell>
                                <Table.Cell>{dateFormat(endDate,"h:MMtt")}</Table.Cell>
                                <Table.Cell>{hours}h {minutes}m</Table.Cell>
                        </Table.Row>)
                 })}
                   
                        </Table.Body>
                        </Table>
            </div>
        )
    }
}
