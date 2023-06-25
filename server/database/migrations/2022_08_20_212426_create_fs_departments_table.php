<?php

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
        Schema::create('fs_departments', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('open_department_id')->index();
            $table->string('open_department_id_link')->nullable()->comment('由父到子的 open_department_id 链路');
            $table->string('name_link')->nullable()->comment('由父到子的名称链路');
            $table->string('name_path')->nullable()->comment('由父到子的名称拼接（显示用）');
            $table->boolean('fs_deleted')->index()->default(false)->comment('飞书部门是否已删除');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('fs_departments');
    }
};
