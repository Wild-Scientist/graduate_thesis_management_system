<?php

use App\Models\Permission;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('code')->index()->unique()->comment('权限代码');
            $table->string('name')->comment('权限名称');
            $table->string('explain')->nullable()->comment('权限说明');
            $table->string('parent_code')->index()->nullable()->comment('父权限代码');
            $table->integer('order')->index()->default(99999)->comment("排序权重，数值小的排前面，默认为99999");
            $table->timestamps();
        });
        // 初始化权限,使用魔术方法获取，Permission类中所有常量
        $permissions = (new Permission())->getAllPermissions();
        foreach ($permissions as $permission) {
            $p = new Permission();
            if(!is_array($permission))continue;
            $p['name']=$permission['label'];
            $p['code']=$permission['value'];
            $p->save();
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('permissions');
    }
};
