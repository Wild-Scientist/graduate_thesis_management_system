#!/usr/bin/env bash

# 核心任务：失败后影响较大难以重复执行的任务，如：飞书事件处理
# 普通任务：失败后可通过重复执行或手动执行弥补的任务，如：同步用户的飞书信息、统计数据计算

# 快通道：用于执行对实时性要求较高的任务，任务耗时最好不要超过 3 分钟
# 慢通道：用于执行对实时性要求不高的任务

###################################################################################

# 单线程通道（可用于禁止并发的场景，也可用于调试任务）
pm2 start scripts/queue-single.sh --name queue-single

# VIP快通道 × 5（仅用于核心任务，超时时间 5 分钟）
for i in `seq 1 5`; do
    pm2 start scripts/queue-vipF.sh --name queue-vipF$i
done

# VIP慢通道 × 3（仅用于核心任务，超时时间 1 小时）
for i in `seq 1 3`; do
    pm2 start scripts/queue-vip.sh --name queue-vip$i
done

# 通用快通道 × 3（仅用于普通任务，超时时间 10 分钟）
for i in `seq 1 3`; do
    pm2 start scripts/queue-commonF.sh --name queue-commonF$i
done

# 通用慢通道 × 3（仅用于普通任务，超时时间 24 小时）
for i in `seq 1 3`; do
    pm2 start scripts/queue-common.sh --name queue-common$i
done

