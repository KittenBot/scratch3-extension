import bindAll from 'lodash.bindall';
import LocalizedStrings from 'react-localization';
import { Modal, Tabs } from 'antd';
import React, { Component } from 'react';
import MonacoEditor from 'react-monaco-editor';

const TabPane = Tabs.TabPane;

class BlockScriptEditor extends Component {
    constructor (props){
        super(props);
        bindAll(this, [
            'onChange',
            'onApply'
        ])
        this.state = {
            script: this.props.blockScript.script
        };
    }

    onChange(newValue, e) {
        this.setState({
            script: newValue
        })
    }
    onApply (){
        this.props.blockScript.applyScript(this.state.script);
        this.props.onClose();
    }
    render (){
        const {
            onClose,
            blockScript,
        } = this.props;

        return (<Modal
            title="Block Script"
            visible={Boolean(blockScript)}
            onOk={this.onApply}
            onCancel={onClose}
            width={640}
        >
            <MonacoEditor 
                width="600"
                height="400"
                language="javascript"
                theme="vs-dark"
                value={this.state.script}
                onChange={this.onChange}
            />
        </Modal>)
    }
}

class BlockGeneratorEditor extends Component {
    constructor (props){
        super(props);
        bindAll(this, [
            'onChange',
            'onApply',
            'switchCode'
        ])
        this.state = {
            genCpp: this.props.gen.genCpp,
            genMpy: this.props.gen.genMpy,
        };
    }

    onChange(newValue, e) {
        this.setState({
            script: newValue
        })
    }
    onApply (){
        this.props.gen.applyGen({
            genCpp: this.state.genCpp,
            genMpy: this.state.genMpy
        });
        this.props.onClose();
    }
    switchCode (c){

    }
    render (){
        const {
            onClose,
            genOption,
            gen,
        } = this.props;

        return (<Modal
            title="Generator Editor"
            visible={Boolean(gen)}
            onOk={this.onApply}
            onCancel={onClose}
            width={640}
        >
            <Tabs onChange={this.switchCode} type="card">
                {genOption.indexOf('arduino') > -1 ? <TabPane tab="Arduino" key="1">
                    <MonacoEditor 
                    width="600"
                    height="400"
                    language="cpp"
                    theme="vs-dark"
                    value={this.state.genCpp}
                    onChange={(code,e) => this.setState({genCpp: code})}
                /></TabPane> :null}
                {genOption.indexOf('micropython') > -1 ? <TabPane tab="Micropython" key="2">
                    <MonacoEditor 
                    width="600"
                    height="400"
                    language="python"
                    theme="vs-dark"
                    value={this.state.genMpy}
                    onChange={(code,e) => this.setState({genMpy: code})}
                /></TabPane> :null}
            </Tabs>
        </Modal>)
    }

}


class CodePreview extends Component {
    constructor (props){
        super(props);
        bindAll(this, [
            'onChange',
            'downloadIndexjs'
        ])
        this.state = {
            script: this.props.code
        };
    }

    downloadIndexjs (){
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(this.state.script);
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", "index.js");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
    onChange(newValue, e) {
        this.setState({
            script: newValue
        })
    }
    render (){
        const {
            code,
            onClose,
        } = this.props;

        return (<Modal
            title="index.js"
            visible={Boolean(code)}
            onCancel={onClose}
            onOk={this.downloadIndexjs}
            width={840}
        >
            <MonacoEditor 
                width="800"
                height="600"
                language="javascript"
                theme="vs-dark"
                value={this.state.script}
                onChange={this.onChange}
            />
        </Modal>)
    }
}



export {
    BlockScriptEditor,
    BlockGeneratorEditor,
    CodePreview
}