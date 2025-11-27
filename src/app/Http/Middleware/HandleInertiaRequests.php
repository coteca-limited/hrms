<?php
namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;
use App\Models\Currency;
use App\Models\LeaveApplication;
use App\Models\Employee;
use App\Models\Complaint;
use App\Models\NotificationRead;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        // Skip database queries during installation
        if ($request->is('install/*') || $request->is('update/*') || !file_exists(storage_path('installed'))) {
            $globalSettings = [
                'currencySymbol' => '$',
                'currencyNname' => 'US Dollar',
                'base_url' => config('app.url'),
                'image_url' => config('app.url'),
                'is_demo' => config('app.is_demo', false),
                'is_saas' => isSaas(),
            ];
        } else {
            // Get system settings
            $settings = settings();
            // $settings = defaultSettings();
            // Get currency symbol
            $currencyCode = $settings['defaultCurrency'] ?? 'USD';
            $currency = Currency::where('code', $currencyCode)->first();
            $currencySettings = [];
            if ($currency) {
                $currencySettings = [
                    'currencySymbol' => $currency->symbol,
                    'currencyNname' => $currency->name
                ];
            } else {
                $currencySettings = [
                    'currencySymbol' =>  '$',
                    'currencyNname' =>'US Dollar'
                ];
            }

            // Merge currency settings with other settings
            $globalSettings = array_merge($settings, $currencySettings);
            $globalSettings['base_url'] = config('app.url');
            $globalSettings['image_url'] = config('app.url');
            $globalSettings['is_demo'] = config('app.is_demo');
            $globalSettings['is_saas'] = isSaas();
        }

        return [
             ...parent::share($request),
            'name'  => config('app.name'),
            'base_url'  => config('app.url'),
            'image_url'  => config('app.url'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'csrf_token' => csrf_token(),
            'auth'  => [
                'user'        => $request->user(),
                'roles'       => fn() => $request->user()?->roles->pluck('name'),
                'permissions' => fn() => $request->user()?->getAllPermissions()->pluck('name'),
            ],
            'isImpersonating' => session('impersonated_by') ? true : false,
            'ziggy' => fn(): array=> [
                 ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
            ],
            'globalSettings' => $globalSettings,
            'is_demo' => env('IS_DEMO', false),
            'notifications' => fn() => $this->notificationData(),
        ];
    }

    private function notificationData()
    {
        $user = auth()->user();
        $today = now()->format('m-d');

        if (!$user || !$user->roles->contains(fn($r) => in_array(strtolower($r->name), ['hr', 'company']))) {
            return ['leaves' => [], 'birthdays' => [], 'anniversary' => [], 'complaints' => []];
        }

        $read = NotificationRead::where('user_id', $user->id)->get()->groupBy('type');

        // $isRead = fn($type, $ref) => $read[$type]->where('ref_id', $ref)->count() > 0 ?? false;
        $isRead = fn($type, $ref) => (($read[$type] ?? collect())->where('ref_id', $ref)->count()) > 0;

        return [
            'leaves' => LeaveApplication::with(['employee', 'leaveType'])
                ->whereIn('status', ['approved', 'pending'])
                ->whereDate('end_date', '>=', now())
                ->get()
                ->map(fn($item) => [
                    'id'       => $item->id,
                    'employee' => $item->employee?->name,
                    'leave_type' => $item->leaveType?->name,
                    'color'      => $item->leaveType?->color,
                    'start'      => $item->start_date,
                    'end'        => $item->end_date,
                    'read'       => $isRead('leaves', $item->id),
                ]),

            'birthdays' => Employee::with('user')
                ->whereRaw("DATE_FORMAT(date_of_birth, '%m-%d') = ?", [$today])
                ->get()
                ->map(fn($emp) => [
                    'id'       => $emp->id,
                    'employee' => $emp->user?->name,
                    'date'     => $emp->date_of_birth,
                    'read'     => $isRead('birthdays', $emp->id),
                ]),

            'anniversary' => Employee::with('user')
                ->whereRaw("DATE_FORMAT(date_of_joining, '%m-%d') = ?", [$today])
                ->get()
                ->map(fn($emp) => [
                    'id'       => $emp->id,
                    'employee' => $emp->user?->name,
                    'years'    => now()->year - \Carbon\Carbon::parse($emp->date_of_joining)->year,
                    'date'     => $emp->date_of_joining,
                    'read'     => $isRead('anniversary', $emp->id),
                ]),

            'complaints' => Complaint::with(['employee', 'againstEmployee'])
                ->whereIn('status', ['submitted'])
                ->orderBy('complaint_date', 'desc')
                ->get()
                ->map(fn($c) => [
                    'id'        => $c->id,
                    'subject'   => $c->subject,
                    'employee'  => $c->employee?->name,
                    'against'   => $c->againstEmployee?->name,
                    'date'      => $c->complaint_date?->format('Y-m-d'),
                    'read'      => $isRead('complaints', $c->id),
                ]),
        ];
    }

}
