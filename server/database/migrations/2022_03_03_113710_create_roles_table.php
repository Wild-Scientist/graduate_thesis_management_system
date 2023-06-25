<?php

use App\Models\Role;
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
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('角色名称');
            $table->timestamps();
            $table->softDeletes();
        });
        // 初始化角色
        $roles = [
            ['id' => Role::ROLE_ID_SUPER, 'name' => '超管'],
            ['id' => Role::ROLE_ID_USER, 'name' => '用户'],
        ];
        foreach ($roles as $role) {
            $r = new Role();
            foreach ($role as $key => $value) {
                $r[$key] = $value;
            }
            $r->save();
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('roles');
    }
};
