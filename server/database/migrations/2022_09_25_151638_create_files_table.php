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
        Schema::create('files', function (Blueprint $table) {
            $table->id();
            $table->string('key')->index()->nullable()->unique();
            $table->string('disk')->nullable()->comment('存储盘');
            $table->boolean('public')->nullable()->default(true)->comment('是否公有访问');
            $table->string('public_path')->nullable()->comment('公有访问路径');
            $table->string('dir')->index()->nullable()->comment('目录');
            $table->string('name')->nullable()->comment('文件名');
            $table->string('original_name')->nullable()->comment('源文件名');
            $table->string('extension')->index()->nullable()->comment('扩展名');
            $table->string('mime')->index()->nullable()->comment('MIME');
            $table->integer('size')->nullable()->comment('大小(KB)');
            $table->string('md5')->index()->nullable()->comment('MD5');
            $table->text('log')->nullable()->comment('日志');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('files');
    }
};
