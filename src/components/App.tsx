import * as React from 'react'
import { Link, browserHistory } from 'react-router'
import { Menu, Container, Segment, Header, Grid } from 'semantic-ui-react'

export default class App extends React.Component<{}, {}> {
    render() {
        return (
            <Container style={{height: '100%', position:'fixed', width: '100%'}}>
                    
                        {this.props.children}
                        
            </Container>
        )
    }
}
