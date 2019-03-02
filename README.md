Here is [Scratch3](https://scratch.mit.edu) extension generator based on [Create React App](https://github.com/facebook/create-react-app).

![image](https://user-images.githubusercontent.com/3390845/53645159-3d5e3300-3c73-11e9-9027-071660c28bfb.png)


## The Scratch3 extension generator

As scratch3 gets better and better, we find that many users want to implement their own plugins. But writing a plugin for scratch3 is not a simple matter, it requires a solid JavaScript development capability; for professional JavaScript programmers, writing a scratch3 plugin is just tedious and waste of time. The purpose of this webapp is to let you complete your scratch3 plugin framework code in 10 minutes. Hope you guys like it~

[中文使用说明](./README_CN.md)

## Instructions

### Step1

Open：[https://kittenbot.github.io/scratch3-extension/](https://kittenbot.github.io/scratch3-extension/)

### Step2

Give your extension a name and ID. Note that the extension ID needs to be in ASCII characters and cannot contain spaces or special strings. The plugin ID should be unique in the runtime context of scratch3.

You can also choose prefered color for your extension.

![image](https://user-images.githubusercontent.com/3390845/53679660-5cf46a80-3d0a-11e9-96f1-befbda4b9372.png)

### Step3

Give your extension an icon. The icon is recommended to use less than 200x200 pixels square png or svg images.

![image](https://user-images.githubusercontent.com/3390845/53679671-9927cb00-3d0a-11e9-8412-9efc5038dfb5.png)

### Step4

Then we will create a block, click on the `Add Function Block`. Then click on the `Add Text Variable` in the pop-up modal box and name the variable to `WORD`. Note that the variable name needs to be ASCII letters, and cannot contain special characters, and recommend all uppercase.

Finally we have to change our block ID, the block ID needs to be unique in the current plugin. Here we will name the ID to `sayhello`.

- Note that the **extension ID** also needs to be an ASCII string and cannot contain a special characters.

![image](https://user-images.githubusercontent.com/3390845/53679707-089dba80-3d0b-11e9-9251-2d07f37a5114.png)

### Step5

You can click on the `Generate Preview` in the upper right corner to see the effect of our plugin loading in scratch3.

![image](https://user-images.githubusercontent.com/3390845/53679761-e35d7c00-3d0b-11e9-9df5-27a95c9ef18c.png)


### Step6

Finally click on the `export index.js` in the lower right corner to export the plugin source code.

For standard scratch3, please load index.js into the extension of `scratch-vm`.

-------------------

The following steps are only valid for Kittenblock. You can download the latest Kittenblock at [https://www.kittenbot.cn/software/] (https://www.kittenbot.cn/software/).

### Step7

Please create a extension folder in the `extensions` directory of the Kittenblock root directory. Here we will name it `sayhello`. Copy the generated `index.js` to this directory.

![image](https://user-images.githubusercontent.com/3390845/53679811-bbbae380-3d0c-11e9-9143-b6b262a0b3cf.png)

### Step8

Create a file named `extension.json` under the changed folder, which contains the following contents:

	{
	    "name": "Say Hello",
	    "type": "scratch3",
	    "image": "logo.png"
	}

Then find a picture you like as the main image of the extension, name it `logo.png`, and put it in the folder. Finally, our `sayhello` folder has the following three files.

![image](https://user-images.githubusercontent.com/3390845/53679853-7d71f400-3d0d-11e9-872a-b20a57d59115.png)

### Step9

Open Kittenblock and select `Load External Plugin` in the lower left corner then find the plugin we just added.

![image](https://user-images.githubusercontent.com/3390845/53679874-c164f900-3d0d-11e9-8391-6786c5200341.png)

The final effect

![image](https://user-images.githubusercontent.com/3390845/53679884-ec4f4d00-3d0d-11e9-95cf-55e9e0db67a4.png)

-------------------

You only need to change the corresponding block execution code in `index.js` to implement the function of a block.

Please keep tuned to our upcoming updates.