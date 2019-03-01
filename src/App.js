import bindAll from 'lodash.bindall';
import LocalizedStrings from 'react-localization';
import { Alert, Row, Col, Button, Layout, Icon, Menu , Divider, Table, Radio, message, Input, Modal, Upload } from 'antd';
import React, { Component } from 'react';
import Blockly from 'scratch-blocks';

import { SketchPicker } from 'react-color';
import logo from './logo.svg';
import './App.css';

const { SubMenu } = Menu;
const { Header, Content, Footer, Sider } = Layout;
const RadioGroup = Radio.Group;

let strings = new LocalizedStrings({
  en:{
    preview: "Generate Preview",
    extdef: "Extension Define",
    maincolor: "Main Color",
    secondcolor: "Second Color",
    menuIcon: "Menu Icon",
    blockIcon: "Block Icon",
    addLabel: "Add Label",
    addInput: "Add String Parameter",
    addInputNum: "Add Number Parameter",
    addBool: "Add Boolean Parameter",
    addblock: "Add Blocks",
    addBlockFun: "Add Functional Block",
    addBlockOutput: "Add Output Block",
    addBlockBool: "Add Boolean Block",
    addBlockHat: "Add Hat Block",
  },
  zh: {
    preview: "生成预览",
    extdef: "插件定义",
    maincolor: "主颜色",
    secondcolor: "次颜色",
    menuIcon: "菜单栏图标",
    blockIcon: "方块图标",
    addLabel: "添加文本",
    addInput: "添加文本变量",
    addInputNum: "添加数字变量",
    addBool: "添加布尔变量",
    addblock: "添加方块",
    addBlockFun: "添加函数方块",
    addBlockOutput: "添加输出方块",
    addBlockBool: "添加布尔方块",
    addBlockHat: "添加帽子方块",
  }
});

const emptyToolBox = `<xml style="display: none">
<category name="Test" id="testExt" colour="#0FBD8C" secondaryColour="#0DA57A" >
</category>
</xml>`;

const blockColumn = [{
  title: 'Op Code',
  dataIndex: 'opcode',
  key: 'opcode',
  render: text => <a href="javascript:;">{text}</a>,
}, {
  title: 'Preview',
  dataIndex: 'svg',
  key: 'svg',
  render: (text, record) => (
    <img src={`data:image/svg+xml;charset=utf-8,${text}`} />
  )
}, {
  title: 'Action',
  key: 'action',
  render: (text, record) => (
    <span>
      <a href="javascript:;">Edit {record.name}</a>
      <Divider type="vertical" />
      <a href="javascript:;">Delete</a>
    </span>
  ),
}];

const OUTPUT_SHAPE_HEXAGONAL = 1;
const OUTPUT_SHAPE_ROUND = 2;
const OUTPUT_SHAPE_SQUARE = 3;

class App extends Component {
  constructor (props){
    super(props);
    this.state = {
      collapsed: false,
      extID: 'testExt',
      extName: 'Test',
      color1: '#0FBD8C',
      color2: '#0DA57A',
      menuIcon: null,
      blockIcon: null,
      editBlockID: 'newblock',
      blocks: [],
      menus: [],
      addBlockType: '',
      showMutation: false
    }
    bindAll(this, [
      "uploadMenuIcon",
      "uploadBlockIcon",
      "closeMutationModal",
      "generatePreview",
      "addBlockFun",
      "addBlockOutput",
      "addBlockBool",
      "addBlockHat",
      "addLabel",
      "addInput",
      "addInputNum",
      "addBool",
      "applyMutation",
      "injectDeclareWorkspace",
      "initEmptyBlock"
    ]);
    window.store = this.state;
  }

  componentDidMount (){
    this.previewWorkspace = Blockly.inject('preview', {
      media: './media/',
      toolbox: emptyToolBox,
      zoom: {
        startScale: 0.75
      }
    });

    Blockly.Procedures.externalProcedureDefCallback = function (mutation, cb) {
      console.log("externalProcedureDefCallback");
    }
    this.previewWorkspace.getFlyout().setRecyclingEnabled(false);
    window.ws = this.previewWorkspace;
  }

  uploadMenuIcon (file){

  }

  uploadBlockIcon (file){


  }

  generatePreview (){
    const xmlParts = [];
    this.previewWorkspace.clear();

    const colorXML = `colour="${this.state.color1}" secondaryColour="${this.state.color2}"`;
    let menuIconURI = '';
    if (this.state.menuIcon) {
        menuIconURI = this.state.menuIcon;
    } else if (this.state.blockIconURI) {
        menuIconURI = this.state.blockIconURI;
    }
    const blockJsons = [];
    const menuIconXML = menuIconURI ?
        `iconURI="${menuIconURI}"` : '';
    xmlParts.push(`<xml style="display: none">`);
    xmlParts.push(`<category name="${this.state.extName}" id="${this.state.extID}" ${colorXML} ${menuIconXML}>`);
    xmlParts.push.apply(xmlParts, this.state.blocks.map(block => {
      const extendedOpcode = `${this.state.extID}_${block.opcode}`;
      const args0 = block.args.map(arg => arg.json);
      const blockJSON = {
        type: extendedOpcode,
        message0: block.msg,
        args0: args0,
        category: this.state.extName,
        colour: this.state.color1,
        inputsInline: true,
        colourSecondary: this.state.color2,
        extensions: ['scratch_extension']
      };
      if (block.type === 'func'){
        blockJSON.outputShape = OUTPUT_SHAPE_SQUARE;
        blockJSON.nextStatement = null;
        blockJSON.previousStatement = null;
      } else if (block.type === 'output'){
        blockJSON.outputShape = OUTPUT_SHAPE_ROUND;
        blockJSON.output = "String";
        blockJSON.checkboxInFlyout = true;
      } else if (block.type === 'bool'){
        blockJSON.output = "Boolean";
        blockJSON.outputShape = OUTPUT_SHAPE_HEXAGONAL;
      }

      blockJsons.push(blockJSON);
      const inputXML = block.args.map(arg => {
        const inputList = [];
        const placeholder = arg.placeholder.replace(/[<"&]/, '_');
        const shadowType = arg.shadowType;
        const fieldType = arg.fieldType;
        const defaultValue = arg.defaultValue || '';
        inputList.push(`<value name="${placeholder}">`);
        if (shadowType) {
          inputList.push(`<shadow type="${shadowType}">`);
          inputList.push(`<field name="${fieldType}">${defaultValue}</field>`);
          inputList.push('</shadow>');
        }
        inputList.push('</value>');
        
        return inputList.join('');
      });
      let blockXML = `<block type="${extendedOpcode}">${inputXML.join('')}</block>`;
      return blockXML;
    }));
    xmlParts.push('</category>');
    xmlParts.push(`</xml>`);
    Blockly.defineBlocksWithJsonArray(blockJsons);
    console.log("extension", xmlParts);
    this.previewWorkspace.updateToolbox(xmlParts.join('\n'));
  }

  closeMutationModal (){
    this.declareWorkspace.clear();
    this.setState({showMutation: false})
  }

  initEmptyBlock (blockType){
    this.mutationRoot = this.declareWorkspace.newBlock('procedures_declaration');
    // this.mutationRoot.setMovable(false);
    this.mutationRoot.setDeletable(false);
    this.mutationRoot.contextMenu = false;

    // override default custom procedure insert
    this.mutationRoot.addStringNumberExternal = function(isNum) {
      Blockly.WidgetDiv.hide(true);
      if (isNum){
        this.procCode_ = this.procCode_ + ' %n';
        this.displayNames_.push('X');
      } else {
        this.procCode_ = this.procCode_ + ' %s';
        this.displayNames_.push('TXT');
      }
      this.argumentIds_.push(Blockly.utils.genUid());
      this.argumentDefaults_.push('');
      this.updateDisplay_();
      this.focusLastEditor_();
    };

    // this.mutationRoot.domToMutation(this.props.mutator);
    var mutationText = '<xml>' +
      '<mutation' +
      ' proccode="' + Blockly.Msg['PROCEDURE_DEFAULT_NAME'] + '"' +
      ' argumentids="[]"' +
      ' argumentnames="[]"' +
      ' argumentdefaults="[]"' +
      ' warp="false">' +
      '</mutation>' +
      '</xml>';
    const dom = Blockly.Xml.textToDom(mutationText).firstChild;
    this.mutationRoot.domToMutation(dom);
    this.mutationRoot.initSvg();
    this.mutationRoot.render();
    if (blockType === 'bool' || blockType === 'output'){
      this.mutationRoot.setPreviousStatement(false, null);
      this.mutationRoot.setNextStatement(false, null);
      this.mutationRoot.setInputsInline(true);
      if (blockType === 'output'){
        this.mutationRoot.setOutputShape(Blockly.OUTPUT_SHAPE_ROUND);
        this.mutationRoot.setOutput(true, 'Boolean');
      } else {
        this.mutationRoot.setOutputShape(Blockly.OUTPUT_SHAPE_HEXAGONAL);
        this.mutationRoot.setOutput(true, 'Number');
      }
    } else {

    }
    const {x, y} = this.mutationRoot.getRelativeToSurfaceXY();
    const dy = (360 / 2) - (this.mutationRoot.height / 2) - y;
    const dx = (480 / 2) - (this.mutationRoot.width / 2) - x;
    this.mutationRoot.moveBy(dx, dy);
    window.mu = this.mutationRoot;
  }

  injectDeclareWorkspace (ref){
    console.log("injectDeclareWorkspace", ref);
    this.blocks = ref;
    const oldDefaultToolbox = Blockly.Blocks.defaultToolbox;
    Blockly.Blocks.defaultToolbox = null;
    this.declareWorkspace = Blockly.inject('declare', {
      media: './media/'
    });
    Blockly.Blocks.defaultToolbox = oldDefaultToolbox;
    
    const _this = this;
    this.declareWorkspace.addChangeListener(function(evt) {
      // console.log(Object.getPrototypeOf(evt).type, evt);
      if (_this.mutationRoot) {
        _this.mutationRoot.onChangeFn();
      }
    });
    this.initEmptyBlock(this.state.addBlockType);
  }

  applyMutation (){
    this.setState({
      showMutation: false
    });
    const svg = this.mutationRoot.getSvgRoot();
    const bbox = svg.getBBox();
    svg.removeAttribute('transform');
    let xml = (new XMLSerializer).serializeToString(svg);
    xml = `<svg id="src" xmlns="http://www.w3.org/2000/svg" width="${bbox.width}" height="${bbox.height}" >
    ${xml}
    </svg>`;

    var mutation = this.mutationRoot.mutationToDom(true)
    console.log(mutation);
    const argNames = JSON.parse(mutation.getAttribute('argumentnames'));
    const args = [];

    // parse proc code
    let argCnt = 0;
    const args0 = [];
    let proccode = this.mutationRoot.getProcCode();
    proccode = proccode.split(" ");
    for (let n=0; n<proccode.length; n++){
      const p = proccode[n];
      if (p === '%s'){ // string
        const argName = argNames[argCnt];
        const arg = {
          placeholder: argName,
          shadowType: 'text',
          fieldType: 'TEXT',
          json: {type: "input_value", name: argName}
        }
        proccode[n] = `%${argCnt+1}`;
        args.push(arg);
        argCnt+=1;
      } else if (p === '%b'){ // bool
        const argName = argNames[argCnt];
        const arg = {
          placeholder: argName,
          // shadowType: 'text',
          // fieldType: 'NUM'
          check: 'Boolean',
          json: {type: "input_value", name: argName, check: "Boolean"}
        }
        proccode[n] = `%${argCnt+1}`;
        args.push(arg);
        argCnt+=1;
      } else if (p === '%n'){ // number
        const argName = argNames[argCnt];
        const arg = {
          placeholder: argName,
          shadowType: 'math_number',
          fieldType: 'NUM',
          json: {type: "input_value", name: argName}
        }
        proccode[n] = `%${argCnt+1}`;
        args.push(arg);
        argCnt+=1;
      }
    }

    const msg = proccode.join(" ");
    const newBlock = {
      opcode: this.state.editBlockID,
      svg: xml,
      msg,
      args,
      type: this.state.addBlockType
    };
    const blocks = [...this.state.blocks].filter(blk => blk.opcode !== this.state.editBlockID);;
    blocks.push(newBlock);
    
    this.setState({
      blocks: blocks
    });
  }

  addLabel (){
    this.mutationRoot.addLabelExternal();
  }
  addInput (){
    this.mutationRoot.addStringNumberExternal();
  }
  addInputNum (){
    this.mutationRoot.addStringNumberExternal(true);
  }
  addBool (){
    this.mutationRoot.addBooleanExternal();
  }
  addBlockFun (){
    this.setState({
      showMutation: true,
      addBlockType: 'func',
    });
    if (this.declareWorkspace){
      this.declareWorkspace.clear();
      this.initEmptyBlock();
    }

  }

  addBlockOutput (){
    this.setState({
      addBlockType: 'output',
      showMutation: true
    });
    if (this.declareWorkspace){
      this.declareWorkspace.clear();
      this.initEmptyBlock('output');
    }
  }

  addBlockBool (){
    this.setState({
      addBlockType: 'bool',
      showMutation: true
    });
    if (this.declareWorkspace){
      this.declareWorkspace.clear();
      this.initEmptyBlock('bool');

    }

  }

  addBlockHat (){
    this.setState({
      addBlockType: 'hat',
      showMutation: true
    });
    if (this.declareWorkspace){
      this.declareWorkspace.clear();
      this.initEmptyBlock('hat');
    }

  }

  render() {
    return (
      <Layout style={{height: '100vh'}}>
        <Sider
          trigger={null}
          collapsible
          collapsed={this.state.collapsed}
        >
          <div className="logo" />
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
            <Menu.Item key="1">
              <Icon type="user" />
              <span>nav 1</span>
            </Menu.Item>
            <Menu.Item key="2">
              <Icon type="video-camera" />
              <span>nav 2</span>
            </Menu.Item>
            <Menu.Item key="3">
              <Icon type="upload" />
              <span>nav 3</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: 0 }}>
            <Icon
              className="trigger"
              type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={() => this.setState({collapsed: !this.state.collapsed})}
            />
          </Header>
          <Content style={{
            margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280,
          }}
          >
            <Row>
              <Col span={14}>
                <Divider>{strings.extdef}</Divider>
                <Row className="config-row">
                  <Col span={1}>
                    <p>ID</p>
                  </Col>
                  <Col span={3}>
                    <Input value={this.state.extID} onChange={this.setTxtX} />
                  </Col>
                  <Col span={2} offset={1}>
                    <p>Name</p>
                  </Col>
                  <Col span={3}>
                    <Input value={this.state.extName} onChange={this.setTxtX} />
                  </Col>
                </Row>
                <Row className="config-row">
                  <Col span={2}>{strings.maincolor}</Col>
                  <Col span={3}>
                    <div className="color-display" style={{background: this.state.color1}} onClick={()=>this.setState({fontColorPick: true})} />
                  </Col>
                  <Col span={2}>{strings.secondcolor}</Col>
                  <Col span={3}>
                  <div className="color-display" style={{background: this.state.color2}} onClick={()=>this.setState({fontColorPick: true})} /> 
                  </Col>
                </Row>
                <Row className="config-row">
                  <Col span={4}>
                    <Upload
                        name="projheader"
                        accept=".png,.svg"
                        className="header-uploader"
                        showUploadList={false}
                        beforeUpload={this.uploadMenuIcon}
                    >
                        <Button><Icon type="picture"/>{strings.menuIcon}</Button>
                    </Upload>
                  </Col>
                  <Col span={4}>
                    <Upload
                        name="projheader"
                        accept=".png,.svg"
                        className="header-uploader"
                        showUploadList={false}
                        beforeUpload={this.uploadBlockIcon}
                    >
                        <Button><Icon type="picture"/>{strings.blockIcon}</Button>
                    </Upload>
                  </Col>
                </Row>
                <Divider>{strings.addblock}</Divider>
                <Row className="btn-wrap">
                  <Button onClick={this.addBlockFun}>{strings.addBlockFun}</Button>
                  <Button onClick={this.addBlockOutput}>{strings.addBlockOutput}</Button>
                  <Button onClick={this.addBlockBool}>{strings.addBlockBool}</Button>
                  <Button onClick={this.addBlockHat}>{strings.addBlockHat}</Button>
                </Row>
                <Divider></Divider>
                <Table columns={blockColumn} dataSource={this.state.blocks} />
              </Col>
              <Col span={8} offset={1}>
                <Button type="primary" shape="round" icon="picture" onClick={this.generatePreview}>{strings.preview}</Button>
                <div id="preview" style={{height: 600, width: 480, marginTop: 10}}></div>
              </Col>
            </Row>
          </Content>
        </Layout>
        <Modal
            title="Modify Block"
            visible={this.state.showMutation}
            onOk={this.applyMutation}
            onCancel={this.closeMutationModal}
        >
          <Row>
            <Col span={3}>
              <p>Block ID</p>
            </Col>
            <Col span={8}>
              <Input value={this.state.editBlockID} onChange={this.setTxtX} />
            </Col>
          </Row>
          <div id="declare" style={{width: 480, height: 360}} ref={this.injectDeclareWorkspace}></div>
          <div className="btn-wrap">
            <Button onClick={this.addLabel}>{strings.addLabel}</Button>
            <Button onClick={this.addInput}>{strings.addInput}</Button>
            <Button onClick={this.addInputNum}>{strings.addInputNum}</Button>
            <Button onClick={this.addBool}>{strings.addBool}</Button>
          </div>
        </Modal>
      </Layout>
    );
  }
}

export default App;
