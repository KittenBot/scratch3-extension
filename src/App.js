import bindAll from 'lodash.bindall';
import LocalizedStrings from 'react-localization';
import { Upload, Row, Col, Button, Layout, Icon, Menu , Divider, Tabs, Radio, message, Input, Modal, Upload } from 'antd';
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
    secondcolor: "Second Color"

  },
  zh: {
    preview: "生成预览",
    extdef: "插件定义",
    maincolor: "主颜色",
    secondcolor: "次颜色"
  }
});

class App extends Component {
  constructor (props){
    super(props);
    this.state = {
      collapsed: false,
      extID: 'testExt'
    }
    this.toolbox = `<xml id="toolbox" style="display:none"></xml>`

  }

  componentDidMount (){
    this.previewWorkspace = Blockly.inject('preview', {
      media: '../media/',
      toolbox: this.toolbox,
      zoom: {
        startScale: 0.75
      }
    });
    window.ws = this.previewWorkspace;
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
              </Col>
              <Col span={8} offset={1}>
                <Button type="primary" shape="round" icon="picture" >{strings.preview}</Button>
                <div id="preview" style={{height: 600, width: 480, marginTop: 10}}></div>
              </Col>
            </Row>
          </Content>
        </Layout>
      </Layout>
    );
  }
}

export default App;
