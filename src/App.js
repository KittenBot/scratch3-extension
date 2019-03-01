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
    addInput: "Add Input Parameter",
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
    addInput: "添加输入变量",
    addBool: "添加布尔变量",
    addblock: "添加方块",
    addBlockFun: "添加函数方块",
    addBlockOutput: "添加输出方块",
    addBlockBool: "添加布尔方块",
    addBlockHat: "添加帽子方块",
  }
});

const emptyToolBox = `<xml id="toolbox" style="display:none"></xml>`;

const blockColumn = [{
  title: 'BlockID',
  dataIndex: 'id',
  key: 'id',
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

class App extends Component {
  constructor (props){
    super(props);
    this.state = {
      collapsed: false,
      extID: 'testExt',
      extName: 'Test',
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
      "addBool",
      "applyMutation",
      "injectDeclareWorkspace",
      "initEmptyBlock"
    ]);
    window.store = this.state;
  }

  componentDidMount (){
    Blockly.Blocks.defaultToolbox = null;

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

    window.ws = this.previewWorkspace;
  }

  uploadMenuIcon (file){

  }

  uploadBlockIcon (file){


  }

  generatePreview (){

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
    this.declareWorkspace = Blockly.inject('declare', {
      media: './media/'
    });
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

    this.setState({
      blocks: [...this.state.blocks, {
        id: this.state.editBlockID,
        svg: xml
      }]
    });

    console.log("xml", xml);
    var mutation = this.mutationRoot.mutationToDom(true)
    console.log(mutation);
  }

  addLabel (){
    this.mutationRoot.addLabelExternal();
  }
  addInput (){
    this.mutationRoot.addStringNumberExternal();
  }
  addBool (){
    this.mutationRoot.addBooleanExternal();
  }
  addBlockFun (){
    this.setState({
      showMutation: true
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
      showMutation: true
    });
    if (this.declareWorkspace) this.declareWorkspace.clear();

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
                    <div className="color-display" style={{background: this.state.mainColor}} onClick={()=>this.setState({fontColorPick: true})} />
                  </Col>
                  <Col span={2}>{strings.secondcolor}</Col>
                  <Col span={3}>
                  <div className="color-display" style={{background: this.state.secondColor}} onClick={()=>this.setState({fontColorPick: true})} /> 
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
            <Button onClick={this.addBool}>{strings.addBool}</Button>
          </div>
        </Modal>
      </Layout>
    );
  }
}

export default App;
