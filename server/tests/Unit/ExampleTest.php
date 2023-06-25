<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use Database\Seeders\FeishuCloudSeeder;
class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     *
     * @return void
     */
    public function test_setRootFolderConstant()
    {
        $seeder=new FeishuCloudSeeder();
        $seeder->setRootFolderConstant();
    }
}
