"""
German public holiday data.
Federal (nationwide) holidays only.
State-specific holidays are not included in MVP.
"""
from datetime import date


def easter_sunday(year: int) -> date:
    """Anonymous Gregorian algorithm for Easter."""
    a = year % 19
    b, c = divmod(year, 100)
    d, e = divmod(b, 4)
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i, k = divmod(c, 4)
    l = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l) // 451
    month, day = divmod(114 + h + l - 7 * m, 31)
    return date(year, month, day + 1)


def get_federal_holidays(year: int) -> list[dict]:
    easter = easter_sunday(year)
    from datetime import timedelta

    def d(offset: int) -> date:
        return easter + timedelta(days=offset)

    return [
        {"date": date(year, 1, 1), "name": "Neujahrstag", "name_en": "New Year's Day"},
        {"date": d(-2), "name": "Karfreitag", "name_en": "Good Friday"},
        {"date": d(1), "name": "Ostermontag", "name_en": "Easter Monday"},
        {"date": date(year, 5, 1), "name": "Tag der Arbeit", "name_en": "Labour Day"},
        {"date": d(39), "name": "Christi Himmelfahrt", "name_en": "Ascension Day"},
        {"date": d(50), "name": "Pfingstmontag", "name_en": "Whit Monday"},
        {"date": d(60), "name": "Fronleichnam", "name_en": "Corpus Christi"},
        {"date": date(year, 10, 3), "name": "Tag der deutschen Einheit", "name_en": "German Unity Day"},
        {"date": date(year, 12, 25), "name": "1. Weihnachtstag", "name_en": "Christmas Day"},
        {"date": date(year, 12, 26), "name": "2. Weihnachtstag", "name_en": "Boxing Day"},
    ]
