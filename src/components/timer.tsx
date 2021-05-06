import React, { Component } from 'react'

export class Timer extends Component {

    myInterval : any
    state = {
        minutes: 0,
        seconds: 99,
        isStopped: () => true,
    }

    constructor(props: any) {
        super(props);
        this.state = {
            minutes: props.minutes,
            seconds: props.seconds,
            isStopped: props.isStopped,
        }
    }

    componentDidMount() {
        this.myInterval = setInterval(() => {
            const { seconds, minutes, isStopped } = this.state

            if (isStopped()) {
                clearInterval(this.myInterval)
                return
            }

            if (seconds > 0) {
                this.setState({seconds: seconds - 1})
            }
            if (seconds === 0) {
                if (minutes === 0) {
                    clearInterval(this.myInterval)
                } else {
                    this.setState({minutes: minutes - 1, seconds: 59})
                }
            } 
        }, 1000)
    }

    componentWillUnmount() {
        clearInterval(this.myInterval)
    }

    render() {
        const { minutes, seconds } = this.state
        return (
            <span>
                { minutes === 0 && seconds === 0
                    ? <span className='warningTime'>Enjoy the extra time!</span>
                    : <span className='goodTime'>Remained Time: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}</span>
                }
            </span>
        )
    }
}