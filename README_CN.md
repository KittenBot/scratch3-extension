这是[Scratch3](https://scratch.mit.edu) 的插件生成器webapp， 基于[Create React App](https://github.com/facebook/create-react-app)开发，请访问[https://kittenbot.github.io/scratch3-extension/](https://kittenbot.github.io/scratch3-extension/)使用.

![image](https://user-images.githubusercontent.com/3390845/53645159-3d5e3300-3c73-11e9-9027-071660c28bfb.png)


## Scratch3插件生成器

随着scratch3越来越完善，我们发现很多用户都想自己实现自己的插件。但是编写scratch3的插件并不是一件简单的事情，这需要比较扎实的JavaScript开发能力；而对于专业的JavaScript程序员来说，写scratch3插件又很浪费时间。这个webapp的目的就是可以让你在10分钟内完成自己的scratch3插件框架代码。希望大家喜欢~

## 使用方法

### Step1

打开网页：[https://kittenbot.github.io/scratch3-extension/](https://kittenbot.github.io/scratch3-extension/)

### Step2

给你的插件取名字和ID。注意插件ID需要全英文，并且不能包含空格和特殊字符串。插件ID在scratch3的运行环境中全局唯一。

之后可以给你的插件选取喜欢的颜色。

![image](https://user-images.githubusercontent.com/3390845/53679660-5cf46a80-3d0a-11e9-96f1-befbda4b9372.png)

### Step3

给插件选择你喜欢的图标，图标建议使用200x200像素以内的正方形png或svg图片。

![image](https://user-images.githubusercontent.com/3390845/53679671-9927cb00-3d0a-11e9-8412-9efc5038dfb5.png)

### Step4

之后我们来新建一个积木块，点击`添加函数方块`. 之后在弹出的模态框中点击`添加文字变量`，并修改变量的名字为`WORD`. 注意变量的名字需要为英文字母,并且不能包含特殊字符串, 并推荐全部大写.

最后我们还要更改我们的积木块ID, 积木块ID需要在当前插件中全局唯一. 这里我们将插件ID命名为`sayhello`.

- 注意**插件ID**同样需要为英文字母,并且不能包含特殊字符串

![image](https://user-images.githubusercontent.com/3390845/53679707-089dba80-3d0b-11e9-9251-2d07f37a5114.png)

### Step5

大家可以点击右上角的`生成预览`查看我们插件在scratch3中加载的效果。

![image](https://user-images.githubusercontent.com/3390845/53679761-e35d7c00-3d0b-11e9-9df5-27a95c9ef18c.png)


### Step6

最后点击右下角的`export index.js`导出插件源代码.

对于标准的scratch3请将index.js加载到scratch-vm的extension中就行了.

-------------------

以下步骤只对Kittenblock有效, 大家可以前往[https://www.kittenbot.cn/software/](https://www.kittenbot.cn/software/)下载最新的Kittenblock.

### Step7

请到Kittenblock的安装目录的`extension`目录下新建一个插件的文件夹，这里我们命名为`sayhello`. 并将刚刚生成的`index.js`拷贝到该目录下.

![image](https://user-images.githubusercontent.com/3390845/53679811-bbbae380-3d0c-11e9-9143-b6b262a0b3cf.png)

### Step8

在该文件夹下面建立一个名为`extension.json`的文件,里面放入如下的内容:

	{
	    "name": "Say Hello",
	    "type": "scratch3",
	    "image": "logo.png"
	}

之后找一张你喜欢的图片作为插件的主图片,命名为`logo.png`,并放入该文件夹下. 最后我们的`sayhello`文件夹下有如下三个文件.

![image](https://user-images.githubusercontent.com/3390845/53679853-7d71f400-3d0d-11e9-872a-b20a57d59115.png)

### Step9

打开Kittenblock，并在左下角选择加载外部插件，可以找到我们刚刚加入的插件。

![image](https://user-images.githubusercontent.com/3390845/53679874-c164f900-3d0d-11e9-8391-6786c5200341.png)

最终效果

![image](https://user-images.githubusercontent.com/3390845/53679884-ec4f4d00-3d0d-11e9-95cf-55e9e0db67a4.png)

-------------------

大家只需要在`index.js`中更改对应的积木执行代码就能实现具体积木的功能了。

