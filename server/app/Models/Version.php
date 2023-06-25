<?php

namespace App\Models;

use App\Traits\ModelSerializeDate;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @mixin Builder
 */
class Version extends Model
{
    use HasFactory, ModelSerializeDate, SoftDeletes;
}
