import * as React from 'react'
import { Link, browserHistory } from 'react-router'
import { Menu, Container, Segment, Header, Grid } from 'semantic-ui-react'

export default class App extends React.Component<{}, {}> {
    render() {
        return (
            <Container style={{height: '100%', position:'fixed', width: '100%'}}>
                    <Grid verticalAlign="middle" centered style={{height: '100%'}}>
                        <Grid.Row style={{height: '100%'}}>     
                        <Grid.Column style={{maxWidth: 400}}>
                        {this.props.children}
                        </Grid.Column>
                            </Grid.Row>
                    </Grid>
            </Container>
        )
    }
}
