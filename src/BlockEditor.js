import bindAll from 'lodash.bindall';
import LocalizedStrings from 'react-localization';
import { Modal } from 'antd';
import React, { Component } from 'react';
import MonacoEditor from 'react-monaco-editor';


class BlockOprator extends Component {
    constructor (props){
        super(props);
        
    }


    render (){
        const {
            visible,
            applyBlockOp,
            close,
            blockScript,
            
        } = this.props;

        return (<Modal
            title="Modify Block"
            visible={visible}
            onOk={applyBlockOp}
            onCancel={close}
        >
            <MonacoEditor 
                width="800"
                height="600"
                language="javascript"
                theme="vs-dark"
            />
        </Modal>)
    }
}




export {
    BlockOprator
}