<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 保存服务器用到的运行时常量
     * @return void
     */
    public function up()
    {
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('project_start_up_id')->unique()->nullable();
            $table->bigInteger('middle_examination_id')->unique()->nullable();
            $table->bigInteger('final_examination_id')->unique()->nullable();
            $table->bigInteger('user_id')->nullable();
            $table->string('document_id')->comment('文档id');
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
        Schema::dropIfExists('contracts');
    }
};
