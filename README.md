我收藏≠我会看，防止GitHub收藏的内容一点不看，搞了个油猴脚本，配合GitHub API，每次访问 star 页面会随机显示自己 star 的仓库，再也不用担心 star 的内容会在收藏夹里吃灰啦~

### 使用方法

注册并登录 Github 后，点击 **右上角头像->Settings**，进入用户设置界面。

![img](https://raw.githubusercontent.com/mewhz/GitHub-Random-Star/main/README.assets/image-27.png)

如下图所示，点击左侧边栏的 Tokens，然后开始创建一个 token。

![img](https://raw.githubusercontent.com/mewhz/GitHub-Random-Star/main/README.assets/image-28.png)

初次设置可能需要你验证，这里可以选择以密码的形式进行安全验证。

![进行 Github 安全验证](https://raw.githubusercontent.com/mewhz/GitHub-Random-Star/main/README.assets/image-30.png)

验证完毕，即可设置 token，如下图所示：设置令牌名称（Note）、到期时间（Expiration）、可访问的权限范围（Select scopes），然后保存即可。

![设置 token 权限范围](https://raw.githubusercontent.com/mewhz/GitHub-Random-Star/main/README.assets/image-31.png)

![Github API 的 token 配置成功](https://raw.githubusercontent.com/mewhz/GitHub-Random-Star/main/README.assets/image-32.png)

最后把获取到的 Token 复制到代码中第一个变量中；

![image-20240204153000953](https://raw.githubusercontent.com/mewhz/GitHub-Random-Star/main/README.assets/image-20240204153000953.png)