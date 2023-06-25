<?php

use App\Models\Role;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('username')->index()->nullable()->comment('用户名');
            $table->string('password')->nullable()->comment('密码');
            $table->string('name')->nullable()->comment('姓名');
            $table->string('avatar')->nullable()->comment('头像');
            $table->string('signature')->nullable()->comment('个性签名');
            $table->string('phone')->index()->nullable()->unique()->comment('手机号');
            $table->string('email')->index()->nullable()->unique()->comment('邮箱');
            $table->timestamp('email_verified_at')->nullable();
            $table->string('student_number')->index()->nullable()->comment('学号');
            $table->string('payroll_number')->index()->nullable()->comment('工资号');
            $table->string('title')->nullable()->comment('头衔');
            $table->string('country')->nullable()->comment('国家');
            $table->string('address')->nullable()->comment('地址');
            $table->string('fs_open_id')->index()->unique()->nullable()->comment('飞书 open id');
            $table->string('fs_union_id')->index()->unique()->nullable()->comment('飞书 union_id');
            $table->string('fs_user_id')->index()->unique()->nullable()->comment('飞书 user id');
            $table->string('fs_access_token')->nullable()->comment('飞书 access token');
            $table->timestamp('fs_access_token_expire_at')->nullable()->comment('飞书 user_access_token 过期时间');
            $table->string('fs_refresh_token')->nullable()->comment('飞书 refresh_token');
            $table->timestamp('fs_refresh_token_expire_at')->nullable()->comment('飞书 refresh_token 过期时间');
            $table->string('fs_avatar_72')->nullable()->comment('飞书头像 72 版本');
            $table->string('fs_avatar_240')->nullable()->comment('飞书头像 240 版本');
            $table->string('fs_avatar_640')->nullable()->comment('飞书头像 640 版本');
            $table->string('fs_avatar_origin')->nullable()->comment('飞书头像原图');
            $table->boolean('fs_deleted')->index()->default(false)->comment('飞书已离职');
            $table->boolean('is_dev')->index()->default(false);
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
        });

        DB::transaction(function(){
            DB::table('users')->insert(['name'=>'超管','username'=>'root','phone'=>'123456789','is_dev'=>true]);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
};
