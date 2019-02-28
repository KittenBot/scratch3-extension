import bindAll from 'lodash.bindall';
import LocalizedStrings from 'react-localization';
import { Alert, Row, Col, Button, Layout, Icon, Menu , Divider, Tabs, Radio, message, Input, Modal, Upload } from 'antd';
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
    addBlockBool: "添加布尔方块",
    addBlockHat: "添加帽子方块",
  }
});

const emptyToolBox = `<xml id="toolbox" style="display:none"></xml>`;
class App extends Component {
  constructor (props){
    super(props);
    this.state = {
      collapsed: false,
      extID: 'testExt',
      extName: 'Test',
      menuIcon: null,
      blockIcon: null,
      blocks: [],
      menus: [],
      showMutation: false
    }
    bindAll(this, [
      "uploadMenuIcon",
      "uploadBlockIcon",
      "closeMutationModal",
      "generatePreview",
      "addBlockFun",
      "addBlockBool",
      "addBlockHat",
      "injectDeclareWorkspace"
    ]);
  }

  componentDidMount (){
    Blockly.Blocks.defaultToolbox = null;

    this.previewWorkspace = Blockly.inject('preview', {
      media: '../media/',
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
    this.setState({showMutation: false})
  }

  injectDeclareWorkspace (ref){
    console.log("injectDeclareWorkspace", ref);
    this.blocks = ref;
    this.declareWorkspace = Blockly.inject('declare', {
      media: '../media/'
    });
    this.mutationRoot = this.declareWorkspace.newBlock('procedures_declaration');
    this.mutationRoot.setMovable(false);
    this.mutationRoot.setDeletable(false);
    this.mutationRoot.contextMenu = false;

    // this.mutationRoot.domToMutation(this.props.mutator);
    this.mutationRoot.initSvg();
    this.mutationRoot.render();
  }

  addBlockFun (){
    this.setState({
      showMutation: true
    });
    if (this.declareWorkspace) this.declareWorkspace.clear();

  }

  addBlockBool (){
    this.setState({
      showMutation: true
    });
    if (this.declareWorkspace) this.declareWorkspace.clear();

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
                  <Button onClick={this.addBlockBool}>{strings.addBlockBool}</Button>
                  <Button onClick={this.addBlockHat}>{strings.addBlockHat}</Button>
                </Row>
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
            onOk={this.closeMutationModal}
            onCancel={this.closeMutationModal}
        >
            <div id="declare" style={{width: 480, height: 360}} ref={this.injectDeclareWorkspace}></div>
            <div className="btn-wrap">
              <Button>{strings.addLabel}</Button>
              <Button>{strings.addInput}</Button>
              <Button>{strings.addBool}</Button>
            </div>
        </Modal>
      </Layout>
    );
  }
}

export default App;
