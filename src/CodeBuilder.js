
const BlockTypeMap = {
  func: "COMMAND",
  output: "REPORTER",
  bool: "BOOLEAN",
  hat: "HAT"
}

const buildEmptyHeadCpp = function (extID){
  return `cppComm(gen){
  gen.includes_['${extID}'] = '#include "YourHeader.h"';
  gen.definitions_['${extID}'] = 'YourClass object;';
};`
}

const buildEmptyHeadMpy = function (extID){
  return `mpyComm(gen){
  gen.includes_['${extID}'] = 'import YourClass';
};`
}

const buildBlockGenCpp = function (opcode, args){
  const code = `${opcode}Cpp (gen, block){\n  cppComm(gen);\n  return gen.template2code(block, '${opcode}')\n}\n`
  return code;
}

const buildBlockGenMpy = function (opcode, args){
  const code = `${opcode}Cpp (gen, block){\n  mpyComm(gen);\n  return gen.template2code(block, '${opcode}')\n}\n`
  return code;
}

const buildBlockOp = function(opcode, args){
  const argDefine = args.reduce((sc, arg) => {
    return sc += `  const ${arg.placeholder} = args.${arg.placeholder};\n`
  }, "")
  const code = `${opcode} (args, util){\n${argDefine}\n  return this.write(\`M0 \\n\`);\n}\n`
  return code;
}

const buildJsCode = function(opt, blocks){
    const blockFunctions = [];
    const blocksInfo = [];

    for (const block of blocks){
      let txt = block.msg;
      let argIndex = 1;
      const blockCode = {
        opcode: `'${block.opcode}'`,
        blockType: `BlockType.${BlockTypeMap[block.type]}`
      };
      if (block.type === 'hat'){
        blockCode.isEdgeActivated = false
      }
      if (block.args.length){
        blockCode.arguments = {};
        for (let n=0;n<block.args.length;n++){
          const arg = block.args[n];
          txt = txt.replace(`%${argIndex}`, `[${arg.json.name}]`);
          // todo: fix missing %n define in custom procedure
          blockCode.arguments[`${arg.json.name}`] = {
            type: `ArgumentType.${arg.argType}`
          }
          argIndex+=1;
        }
      }
      blockCode.text = `'${txt}'`;
      const script = block.script || buildBlockOp(block.opcode, block.args);
      blockFunctions.push(script)
      if (block.genCpp || block.genMpy){
        blockCode.gen = {};
        if (block.genCpp){
          blockCode.gen.arduino = `this.${block.opcode}Cpp`
          blockFunctions.push(block.genCpp);
        }
        if (block.genMpy){
          blockCode.gen.micropy = `this.${block.opcode}Mpy`
          blockFunctions.push(block.genMpy);
        }
      }

      blocksInfo.push(blockCode)
    }
    
    let blkInfoCode = JSON.stringify(blocksInfo, null, 2);
    blkInfoCode = blkInfoCode.replace(/"/g, '');
    blkInfoCode = blkInfoCode.replace(/\n/g, '\n      ')

    opt.genCppHead && blockFunctions.push(opt.genCppHead);
    opt.genMpyHead && blockFunctions.push(opt.genMpyHead);

    const indexJS = `
// create by scratch3-extension generator
const ArgumentType = Scratch.ArgumentType;
const BlockType = Scratch.BlockType;
const formatMessage = Scratch.formatMessage;
const log = Scratch.log;

const menuIconURI = ${opt.menuIconURI};
const blockIconURI = ${opt.blockIconURI};

class ${opt.className}{
  constructor (runtime){
    this.runtime = runtime;
    // communication related
    this.comm = runtime.ioDevices.comm;
    this.session = null;
    this.runtime.registerPeripheralExtension('${opt.extID}', this);
    // session callbacks
    this.reporter = null;
    this.onmessage = this.onmessage.bind(this);
    this.onclose = this.onclose.bind(this);
    this.write = this.write.bind(this);
    // string op
    this.decoder = new TextDecoder();
    this.lineBuffer = '';
  }

  onclose (){
    this.session = null;
  }

  write (data, parser = null){
    if (this.session){
      return new Promise(resolve => {
        if (parser){
          this.reporter = {
            parser,
            resolve
          }
        }
        this.session.write(data);
      })
    }
  }

  onmessage (data){
    const dataStr = this.decoder.decode(data);
    this.lineBuffer += dataStr;
    if (this.lineBuffer.indexOf('\\n') !== -1){
      const lines = this.lineBuffer.split('\\n');
      this.lineBuffer = lines.pop();
      for (const l of lines){
        if (this.reporter){
          const {parser, resolve} = this.reporter;
          resolve(parser(l));
        };
      }
    }
  }

  scan (){
    this.comm.getDeviceList().then(result => {
        this.runtime.emit(this.runtime.constructor.PERIPHERAL_LIST_UPDATE, result);
    });
  }

  getInfo (){
    return {
      id: '${opt.extID}',
      name: '${opt.extName}',
      color1: '${opt.color1}',
      color2: '${opt.color2}',
      menuIconURI: menuIconURI,
      blockIconURI: blockIconURI,
      blocks: ${blkInfoCode}
    }
  }

${blockFunctions.join('\n')}
}

module.exports = ${opt.className};
`;

  return indexJS;
}



export {
  buildJsCode,
  buildBlockOp,
  buildBlockGenCpp,
  buildBlockGenMpy,
  buildEmptyHeadCpp,
  buildEmptyHeadMpy
};