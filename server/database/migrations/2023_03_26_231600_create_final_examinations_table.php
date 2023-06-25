<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('final_examinations', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('user_id')->comment('发起人 ID');
            $table->string('fs_department_open_id')->nullable()->comment('发起人所属单位');
            $table->string('title')->comment('项目标题');
            $table->string('type')->comment('类别');
            $table->text('project_content')->comment('项目内容');
            $table->string('status')->comment('状态');
            $table->boolean('failed')->comment('是否是被退回的')->default(false);
            $table->boolean('is_withdrew')->comment('是否是撤销的')->default(false);
            $table->string('file_key');
            $table->softDeletes();
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
        Schema::dropIfExists('final_examinations');
    }
};
