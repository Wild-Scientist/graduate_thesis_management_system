# Seed Server Laravel

# 飞书项目初始化要求

## 项目配置

- 将对应的飞书应用 appId 和 appSecret 填入 env文件

## 飞书后台配置
- 增加应用权限：
  - 以应用身份读取通讯录
  - 获取用户 user ID
  - 获取用户手机号
- 设置通讯录权限：根据实际情况设置，建议设置全部成员
- 设置可用成员：根据实际情况设置
- 设置事件监听回调地址：{host}/api/fs_event
- 增加事件监听：
  - 审批实例状态变更 approval_instance
  - 员工信息变化 contact.user.updated_v3
  - 部门信息变化 contact.department.updated_v3
