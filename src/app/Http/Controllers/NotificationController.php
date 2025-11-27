<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\NotificationRead;

class NotificationController extends Controller
{


    public function markRead(Request $request)
    {

        NotificationRead::firstOrCreate([
            'user_id' => auth()->id(),
            'type'    => $request->type,
            'ref_id'  => $request->ref_id,
        ]);

    }

}
