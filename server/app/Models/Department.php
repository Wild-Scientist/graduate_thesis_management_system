<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @mixin Builder
 */
class Department extends Model
{
    use HasFactory, SoftDeletes;

    public function users(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(User::class)->withTimestamps();
    }

    public function hasChildren(): bool
    {
        return !!(new Department)
            ->where('parent_id', $this->{'id'})
            ->first();
    }

    public function freshIsLeaf()
    {
        $this->{'is_leaf'} = !$this->hasChildren();
        $this->save();
    }
}
