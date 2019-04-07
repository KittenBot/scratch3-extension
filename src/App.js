import bindAll from 'lodash.bindall';
import LocalizedStrings from 'react-localization';
import { Checkbox, Row, Col, Button, Layout, Icon, Menu , Divider, Table, Radio, Popconfirm, Input, Modal, Upload, Tooltip, message } from 'antd';
import React, { Component } from 'react';
import Blockly from 'scratch-blocks';

import { SketchPicker } from 'react-color';
import logo from './s3ext.png';
import './App.css';
import {BlockScriptEditor, CodePreview, BlockGeneratorEditor} from './BlockEditor';
import { string } from 'postcss-selector-parser';

import micropyImg from './micropy.png';
import arduinoImg from './arduino.png';
import pythonImg from './python.png';

import {buildJsCode, buildBlockOp, 
  buildBlockGenCpp, buildBlockGenMpy,
  buildEmptyHeadCpp, buildEmptyHeadMpy
} from './CodeBuilder';

const { SubMenu } = Menu;
const { Header, Content, Footer, Sider } = Layout;
const RadioGroup = Radio.Group;

let strings = new LocalizedStrings({
  en:{
    extID: "Extension ID",
    extName: "Extension Name",
    preview: "Generate Preview",
    extdef: "Extension Define",
    generator: "Blocks to Code",
    maincolor: "Extension Color",
    secondcolor: "Parameter Color",
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
    delSure: "delete this block?",
    uniqBlockId: "* block ID should be unique",
    uniqBlockName: "* block parameter names should be unique",
    genHeader: "Edit Header",
    promptBlkID: "Please Enter Block ID"
  },
  zh: {
    extID: "插件ID",
    extName: "插件名称",
    preview: "生成预览",
    extdef: "插件定义",
    generator: "图形化转代码",
    maincolor: "插件颜色",
    secondcolor: "变量颜色",
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
    delSure: "删除该方块?",
    uniqBlockId: "* 积木ID需要全局唯一",
    uniqBlockName: "* 积木参数名字需要唯一",
    genHeader: "编辑头文件",
    promptBlkID: "请输入方块ID"
  }
});

const emptyToolBox = `<xml style="display: none">
<category name="Test" id="testExt" colour="#0FBD8C" secondaryColour="#0DA57A" >
</category>
</xml>`;

const OUTPUT_SHAPE_HEXAGONAL = 1;
const OUTPUT_SHAPE_ROUND = 2;
const OUTPUT_SHAPE_SQUARE = 3;


const extOption = [
  { label: <span><img className="radio-img" src={arduinoImg} />Arduino</span>, value: 'arduino' },
  { label: <span><img className="radio-img" src={micropyImg} />Micro Python</span>, value: 'micropython' }
];

class App extends Component {
  constructor (props){
    super(props);
    this.state = {
      collapsed: true,
      extID: 'testExt',
      extName: 'Test',
      color1Pick: false,
      color2Pick: false,
      color1: '#0FBD8C',
      color2: '#0DA57A',
      indexJS: null,
      menuIcon: null,
      blockIcon: null,
      editBlockID: 'newblock',
      blocks: [],
      menus: [],
      addBlockType: '',
      showMutation: false,
      blockScript: null,
      genOption: [],
      genHeadScript: null,
      blockGenerator: null,
      isShowCodePreview: false
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
      "makeBlock",
      "editBlock",
      "deleteBlock",
      "saveToJson",
      "generateIndexJS",
      "loadFromJson",
      "exportJs",
      "editBlockScript",
      "editGeneratorHead",
      "editBlockGenerator",
      "onExtoptionChange"
    ]);

    this.blockColumn = [{
      title: 'Op Code',
      dataIndex: 'opcode',
      key: 'opcode',
      width: '20%',
      render: text => <a href="javascript:;">{text}</a>,
    }, {
      title: 'Preview',
      dataIndex: 'svg',
      key: 'svg',
      render: (text, record) => (
        <img src={`data:image/svg+xml;utf8,${text}`} />
      )
    }, , {
      title: 'block op',
      key: 'blockop',
      render: (text, record) => (
        <span>
          <a href="#" onClick={() => this.editBlockScript(record.opcode)} >
            <Tooltip title="Block Script">
              <Icon type="message" theme="twoTone" style={{fontSize: 24}}/>
            </Tooltip>
          </a>
          <Divider type="vertical" />
          <a href="#" onClick={() => this.editBlockGenerator(record.opcode)} >
            <Tooltip title="Block To Code">
              <Icon type="code" theme="twoTone" style={{fontSize: 24}}/>
            </Tooltip>
          </a>
        </span>
      )
    }, {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <span>
          <a href="#" onClick={() => this.editBlock(record.opcode)} >Edit {record.name}</a>
          <Divider type="vertical" />
          <Popconfirm title={strings.delSure} onConfirm={() => this.deleteBlock(record.opcode)}>
            <a href="#">Delete</a>
          </Popconfirm>
        </span>
      ),
    }];
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

  onExtoptionChange (opt){
    this.setState({
      genOption: opt
    })
  }

  uploadMenuIcon (file){
    let reader = new FileReader();
    const _this = this;
    reader.onerror = function () {
      console.warn("read image file error")
    };

    reader.onload = function (ev) {
      const dataUri = reader.result;
      _this.setState({menuIcon: dataUri});
    };
    reader.readAsDataURL(file);
  }

  uploadBlockIcon (file){
    let reader = new FileReader();
    const _this = this;
    reader.onerror = function () {
      console.warn("read image file error")
    };

    reader.onload = function (ev) {
      const dataUri = reader.result;
      _this.setState({blockIcon: dataUri});
    };
    reader.readAsDataURL(file);
  }

  generatePreview (){
    const xmlParts = [];
    this.previewWorkspace.clear();

    const colorXML = `colour="${this.state.color1}" secondaryColour="${this.state.color2}"`;
    let menuIconURI = '';
    if (this.state.menuIcon) {
        menuIconURI = this.state.menuIcon;
    } else if (this.state.blockIcon) {
        menuIconURI = this.state.blockIcon;
    }
    const blockJsons = [];
    const menuIconXML = menuIconURI ?
        `iconURI="${menuIconURI}"` : '';
    xmlParts.push(`<xml style="display: none">`);
    xmlParts.push(`<category name="${this.state.extName}" id="${this.state.extID}" ${colorXML} ${menuIconXML}>`);
    xmlParts.push.apply(xmlParts, this.state.blocks.map(block => {
      const extendedOpcode = `${this.state.extID}_${block.opcode}`;
      let argIndex = 0;
      const blockJSON = {
        type: extendedOpcode,
        category: this.state.extName,
        colour: this.state.color1,
        inputsInline: true,
        colourSecondary: this.state.color2,
        extensions: ['scratch_extension']
      };
      const iconURI = this.state.blockIcon;

      if (iconURI) {
          blockJSON.message0 = '%1 %2';
          const iconJSON = {
              type: 'field_image',
              src: iconURI,
              width: 40,
              height: 40
          };
          const separatorJSON = {
              type: 'field_vertical_separator'
          };
          blockJSON.args0 = [
              iconJSON,
              separatorJSON
          ];
          argIndex+=1;
      }

      blockJSON[`message${argIndex}`] = block.msg;
      blockJSON[`args${argIndex}`] = block.args.map(arg => arg.json);


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
      } else if (block.type === 'hat'){
        blockJSON.outputShape = OUTPUT_SHAPE_SQUARE;
        blockJSON.nextStatement = null;
        blockJSON.previousStatement = undefined; // hack to hat module
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

  makeBlock (blockType, mutationText){
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
    if (!mutationText){
      mutationText = '<xml>' +
        '<mutation' +
        ' proccode="' + Blockly.Msg['PROCEDURE_DEFAULT_NAME'] + '"' +
        ' argumentids="[]"' +
        ' argumentnames="[]"' +
        ' argumentdefaults="[]"' +
        ' warp="false">' +
        '</mutation>' +
        '</xml>';
    }
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
    } else if (blockType === 'hat') {
      this.mutationRoot.setPreviousStatement(undefined, null);
      this.mutationRoot.setNextStatement(true, null);
      this.mutationRoot.setInputsInline(true);
    }
    const {x, y} = this.mutationRoot.getRelativeToSurfaceXY();
    const dy = (360 / 2) - (this.mutationRoot.height / 2) - y;
    const dx = (480 / 2) - (this.mutationRoot.width / 2) - x;
    this.mutationRoot.moveBy(dx, dy);
    window.mu = this.mutationRoot;
  }

  injectDeclareWorkspace (ref){
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
        // todo: blockly turn %n to %s in updateDeclarationProcCode_
        _this.mutationRoot.onChangeFn();
      }
    });
    this.makeBlock(this.state.addBlockType);
  }

  applyMutation (){
    const svg = this.mutationRoot.getSvgRoot();
    const bbox = svg.getBBox();
    svg.removeAttribute('transform');
    let xml = (new XMLSerializer).serializeToString(svg);
    xml = `<svg id="src" xmlns="http://www.w3.org/2000/svg" width="${bbox.width}" height="${bbox.height}" >
    ${encodeURIComponent(xml)}
    </svg>`;

    const mutation = this.mutationRoot.mutationToDom(true)
    // console.log(mutation);
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
          argType: 'STRING',
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
          argType: 'BOOLEAN',
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
          argType: 'NUMBER',
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
    let mutationText = `<xml>${Blockly.Xml.domToText(mutation)}</xml>`;
    console.log("mutationText >>", mutationText);
    const newBlock = {
      opcode: this.state.editBlockID,
      svg: xml,
      msg,
      args,
      mutationText: mutationText,
      type: this.state.addBlockType
    };
    const blocks = [...this.state.blocks].filter(blk => blk.opcode !== this.state.editBlockID);
    blocks.push(newBlock);
    
    this.setState({
      showMutation: false,
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
    const blkid = prompt(strings.promptBlkID);
    if (!blkid || blkid.length == 0) return;
    this.setState({
      editBlockID: blkid,
      showMutation: true,
      addBlockType: 'func',
    });
    if (this.declareWorkspace){
      this.declareWorkspace.clear();
      this.makeBlock();
    }

  }

  addBlockOutput (){
    const blkid = prompt(strings.promptBlkID);
    if (!blkid || blkid.length == 0) return;
    this.setState({
      editBlockID: blkid,
      addBlockType: 'output',
      showMutation: true
    });
    if (this.declareWorkspace){
      this.declareWorkspace.clear();
      this.makeBlock('output');
    }
  }

  addBlockBool (){
    const blkid = prompt(strings.promptBlkID);
    if (!blkid || blkid.length == 0) return;
    this.setState({
      editBlockID: blkid,
      addBlockType: 'bool',
      showMutation: true
    });
    if (this.declareWorkspace){
      this.declareWorkspace.clear();
      this.makeBlock('bool');

    }

  }

  addBlockHat (){
    const blkid = prompt(strings.promptBlkID);
    if (!blkid || blkid.length == 0) return;
    this.setState({
      editBlockID: blkid,
      addBlockType: 'hat',
      showMutation: true
    });
    if (this.declareWorkspace){
      this.declareWorkspace.clear();
      this.makeBlock('hat');
    }

  }

  editBlock (opcode){
    const block = this.state.blocks.filter(blk => blk.opcode === opcode);
    if (block && block.length == 1){
      this.declareWorkspace.clear();
      this.makeBlock(block[0].type, block[0].mutationText);
      this.setState({
        editBlockID: opcode,
        showMutation: true,
        addBlockType: block[0].type
      });
    }
  }

  deleteBlock (opcode){
    const blocks = [...this.state.blocks].filter(blk => blk.opcode !== opcode);
    this.setState({blocks});
  }

  editBlockScript (opcode){
    const block = this.state.blocks.filter(blk => blk.opcode === opcode);
    if (block && block.length == 1){
      const blk = block[0];
      if (!blk.script){
        blk.script = buildBlockOp(blk.opcode, blk.args);
      }
      this.setState({
        blockScript: {
          opcode: blk.opcode,
          script: blk.script,
          applyScript: (script) => {
            blk.script = script
          }
        }
      });
    }
  }

  editGeneratorHead (){
    const genHeadScript = {
      applyGen: (gen) => {
        if (gen.genCpp) this.setState({genCppHead: gen.genCpp});
        if (gen.genMpy) this.setState({genMpyHead: gen.genMpy});
      }
    }
    for (const code of this.state.genOption){
      if (code === 'arduino'){
        genHeadScript.genCpp = this.state.genCppHead || buildEmptyHeadCpp(this.state.extID);
      } else if(code === 'micropython'){
        genHeadScript.genMpy = this.state.genMpyHead || buildEmptyHeadMpy(this.state.extID);
      }
    }
    this.setState({genHeadScript});
  }

  editBlockGenerator (opcode){
    const block = this.state.blocks.filter(blk => blk.opcode === opcode);
    if (block && block.length == 1){
      const blk = block[0];
      const blockGenerator = {
        opcode: blk.opcode,
        applyGen: (gen) => {
          if (gen.genCpp) blk.genCpp = gen.genCpp;
          if (gen.genMpy) blk.genMpy = gen.genMpy;
        }
      }
      if (!blk.gen){
        for (const code of this.state.genOption){
          if (code === 'arduino'){
            blockGenerator.genCpp = blk.genCpp || buildBlockGenCpp(blk.opcode, blk.args);
          } else if(code === 'micropython'){
            blockGenerator.genMpy = blk.genMpy || buildBlockGenMpy(blk.opcode, blk.args);
          }
        }
      }
      this.setState({blockGenerator});
    }
  }

  saveToJson (){
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", this.state.extID + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  loadFromJson (file){
    if (file){
      let reader = new FileReader();
      const _this = this;
      reader.onerror = function () {
          console.warn("read image file error")
      };
      reader.onload = ev => {
        this.setState(Object.assign({},
          JSON.parse(reader.result)
        ))
      }
      reader.readAsText(file);
    }
  }

  generateIndexJS (){
    const option = {
      className: this.state.extID,
      extID: this.state.extID,
      extName: this.state.extName,
      color1: this.state.color1,
      color2: this.state.color2,
      menuIconURI: this.state.menuIcon ? `"${this.state.menuIcon}"` : 'null',
      blockIconURI: this.state.blockIcon ? `"${this.state.blockIcon}"` : 'null',
      genCppHead: this.state.genCppHead,
      genMpyHead: this.state.genMpyHead,
    }
    const indexJS = buildJsCode(option, this.state.blocks);
    return indexJS;
  }

  exportJs (){
    this.setState({
      indexJS: this.generateIndexJS()
    }, () => this.setState({isShowCodePreview: true}));    
  }

  render() {
    return (
      <Layout style={{height: '100vh'}}>
        <Sider
          trigger={null}
          collapsible
          collapsed={this.state.collapsed}
        >
          <div className="logo" >
            <img src={logo} style={{height: 40}}/>
          </div>
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
            <Menu.Item key="1">
              <Icon type="plus" />
              <span>New Extension</span>
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
                  <Col span={2}>
                    <p>{strings.extID}</p>
                  </Col>
                  <Col span={3}>
                    <Input value={this.state.extID} onChange={e => this.setState({extID: e.target.value})} />
                  </Col>
                  <Col span={2} offset={1}>
                    <p>{strings.extName}</p>
                  </Col>
                  <Col span={3}>
                    <Input value={this.state.extName} onChange={e => this.setState({extName: e.target.value})} />
                  </Col>
                </Row>
                <Row className="config-row">
                  <Col span={2}>{strings.maincolor}</Col>
                  <Col span={3}>
                    <div className="color-display" style={{background: this.state.color1}} onClick={()=>this.setState({color1Pick: true})} />
                    { this.state.color1Pick ? <div style={{position: "absolute", zIndex: '2'}}>
                      <div className="color-cover" onClick={()=>this.setState({color1Pick: false})}/>
                        <SketchPicker color={ this.state.color1 } onChange={c => this.setState({color1: c.hex})} />
                      </div> : null }
                  </Col>
                  <Col span={2}>{strings.secondcolor}</Col>
                  <Col span={3}>
                    <div className="color-display" style={{background: this.state.color2}} onClick={()=>this.setState({color2Pick: true})} />
                    { this.state.color2Pick ? <div style={{position: "absolute", zIndex: '2'}}>
                      <div className="color-cover" onClick={()=>this.setState({color2Pick: false})}/>
                        <SketchPicker color={ this.state.color2 } onChange={c => this.setState({color2: c.hex})} />
                      </div> : null }
                  </Col>
                </Row>
                <Row className="config-row">
                  <Col span={4}>
                    {this.state.menuIcon ? <img className="icon-img" src={this.state.menuIcon} /> : null}
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
                    {this.state.blockIcon ? <img className="icon-img" src={this.state.blockIcon} /> : null}
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
                <Divider>{strings.generator}</Divider>
                <Row>
                  <Checkbox.Group options={extOption} defaultValue={[]} onChange={this.onExtoptionChange} />
                  <Divider type="vertical" />
                  <Button onClick={this.editGeneratorHead}>{strings.genHeader}</Button>
                </Row>
                <Divider>{strings.addblock}</Divider>
                <Row className="btn-wrap">
                  <Button onClick={this.addBlockFun}>{strings.addBlockFun}</Button>
                  <Button onClick={this.addBlockOutput}>{strings.addBlockOutput}</Button>
                  <Button onClick={this.addBlockBool}>{strings.addBlockBool}</Button>
                  <Button onClick={this.addBlockHat}>{strings.addBlockHat}</Button>
                </Row>
                <Divider></Divider>
                <Table columns={this.blockColumn} dataSource={this.state.blocks} />
              </Col>
              <Col span={8} offset={1}>
                <Button type="primary" shape="round" icon="picture" onClick={this.generatePreview}>{strings.preview}</Button>
                <div id="preview" style={{height: 600, width: 480, marginTop: 10}}></div>
                <Row className="btn-wrap">
                  <Button onClick={this.saveToJson}>Save</Button>
                  <Upload 
                    name="jsonUpload"
                    accept=".json"
                    className="header-uploader"
                    showUploadList={false}
                    beforeUpload={this.loadFromJson}
                  >
                    <Button>Open</Button>
                  </Upload>
                  <Button type="primary" onClick={this.exportJs}>Export index.js</Button>
                </Row>
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
          <div id="declare" style={{width: 480, height: 360}} ref={this.injectDeclareWorkspace}></div>
          <div className="btn-wrap">
            <Button onClick={this.addLabel}>{strings.addLabel}</Button>
            <Button onClick={this.addInput}>{strings.addInput}</Button>
            <Button onClick={this.addInputNum}>{strings.addInputNum}</Button>
            <Button onClick={this.addBool}>{strings.addBool}</Button>
          </div>
          <p>{strings.uniqBlockName}</p>
          <Divider />
          <Row>
            <Col span={3}>
              <p>Block ID</p>
            </Col>
            <Col span={8}>
              <Input value={this.state.editBlockID} onChange={e => this.setState({editBlockID: e.target.value})} />
            </Col>
            <Col span={12}>
              <p>{strings.uniqBlockId}</p>
            </Col>
          </Row>
        </Modal>
        {this.state.genHeadScript ? <BlockGeneratorEditor
          gen={this.state.genHeadScript}
          genOption={this.state.genOption}
          onClose={() => this.setState({genHeadScript: null})}
        /> : null}
        {this.state.blockScript ? <BlockScriptEditor
          blockScript={this.state.blockScript}
          onClose={() => this.setState({blockScript: null})}
        /> : null}
        {this.state.blockGenerator ? <BlockGeneratorEditor
          gen={this.state.blockGenerator}
          genOption={this.state.genOption}
          onClose={() => this.setState({blockGenerator: null})}
        /> : null}
        {this.state.isShowCodePreview ? <CodePreview
          code={this.state.indexJS}
          onClose={() => this.setState({isShowCodePreview: false})}
        /> : null}
      </Layout>
    );
  }
}

export default App;
