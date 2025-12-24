import threading
from django.http import JsonResponse, HttpResponseForbidden
from django.views.decorators.http import require_POST
from django.conf import settings
from django.core.management import call_command


@require_POST
def run_daily(request):
    token = request.headers.get("X-INTERNAL-TOKEN") or request.POST.get("token")
    expected = getattr(settings, "INTERNAL_RUN_DAILY_TOKEN", None)
    if not expected or token != expected:
        return HttpResponseForbidden("Forbidden")

    def _run():
        try:
            call_command("send_daily_reminders")
        except Exception:
            # management command handles its own logging
            pass

    thread = threading.Thread(target=_run, daemon=True)
    thread.start()
    return JsonResponse({"status": "accepted"}, status=202)
