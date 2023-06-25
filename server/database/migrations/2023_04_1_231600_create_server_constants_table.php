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
        Schema::create('server_constants', function (Blueprint $table) {
            $table->id();
            $table->string('key')->index()->unique()->comment('常量名');
            $table->string('value')->comment('值');
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
        Schema::dropIfExists('server_constants');
    }
};
