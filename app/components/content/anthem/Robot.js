import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';

import BaseCom from '@/app/components/BaseComponent';


class Robot extends BaseCom {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div
                style={{
                width: this.props.info.domWidth,
                position: 'absolute',
                left: this.props.info.left,
                top: this.props.info.top
            }}>
                <img
                    src={"http://172.17.120.218:10086/" + this.props.info.img}
                    style={{
                    maxWidth: '100%',
                    border: 0,
                    display: 'block'
                }}/>
            </div>
        )
    }
}

export default connect()(Robot);