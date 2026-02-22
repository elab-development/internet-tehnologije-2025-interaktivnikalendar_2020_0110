<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Dogadjaj;
use App\Models\Kalendar;
use App\Models\Notifikacija;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminStatsController extends Controller
{
    public function summary()
    {
        return response()->json([
            'data' => [
                'users_total' => User::count(),
                'calendars_total' => Kalendar::count(),
                'events_total' => Dogadjaj::count(),
                'notifications_total' => Notifikacija::count(),
            ]
        ]);
    }

    public function notificationsByStatus()
    {
        $rows = Notifikacija::query()
            ->select('status', DB::raw('COUNT(*) as cnt'))
            ->groupBy('status')
            ->get();

        $map = [
            'na_cekanju' => 0,
            'poslato' => 0,
            'greska' => 0,
        ];

        foreach ($rows as $r) {
            $status = (string)$r->status;
            if (array_key_exists($status, $map)) {
                $map[$status] = (int)$r->cnt;
            }
        }

        return response()->json([
            'data' => $map
        ]);
    }

    public function usersOverTime(Request $request)
    {
        $days = (int)($request->query('days', 30));
        if ($days < 7) $days = 7;
        if ($days > 365) $days = 365;

        $end = Carbon::today();
        $start = (clone $end)->subDays($days - 1);

        $rows = User::query()
            ->select(DB::raw('DATE(created_at) as d'), DB::raw('COUNT(*) as cnt'))
            ->whereDate('created_at', '>=', $start->toDateString())
            ->whereDate('created_at', '<=', $end->toDateString())
            ->groupBy('d')
            ->orderBy('d', 'asc')
            ->get();

        $byDay = [];
        foreach ($rows as $r) {
            $byDay[(string)$r->d] = (int)$r->cnt;
        }

        $labels = [];
        $values = [];

        $cursor = $start->copy();
        while ($cursor->lte($end)) {
            $key = $cursor->toDateString();
            $labels[] = $key;
            $values[] = $byDay[$key] ?? 0;
            $cursor->addDay();
        }

        return response()->json([
            'data' => [
                'labels' => $labels,
                'series' => [
                    [
                        'name' => 'Korisnici',
                        'data' => $values
                    ]
                ]
            ]
        ]);
    }

    public function eventsOverTime(Request $request)
    {
        $days = (int)($request->query('days', 30));
        if ($days < 7) $days = 7;
        if ($days > 365) $days = 365;

        $end = Carbon::today();
        $start = (clone $end)->subDays($days - 1);

        $rows = Dogadjaj::query()
            ->select(DB::raw('DATE(pocetak) as d'), DB::raw('COUNT(*) as cnt'))
            ->whereDate('pocetak', '>=', $start->toDateString())
            ->whereDate('pocetak', '<=', $end->toDateString())
            ->groupBy('d')
            ->orderBy('d', 'asc')
            ->get();

        $byDay = [];
        foreach ($rows as $r) {
            $byDay[(string)$r->d] = (int)$r->cnt;
        }

        $labels = [];
        $values = [];

        $cursor = $start->copy();
        while ($cursor->lte($end)) {
            $key = $cursor->toDateString();
            $labels[] = $key;
            $values[] = $byDay[$key] ?? 0;
            $cursor->addDay();
        }

        return response()->json([
            'data' => [
                'labels' => $labels,
                'series' => [
                    [
                        'name' => 'Događaji',
                        'data' => $values
                    ]
                ]
            ]
        ]);
    }
}