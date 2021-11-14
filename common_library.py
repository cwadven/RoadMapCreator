from rest_framework.exceptions import APIException


def mandatory_key(request, name):
    try:
        if request.method == 'GET':
            data = request.GET[name]
        else:
            data = request.POST[name]
        if data == '':
            raise APIException(f"missing mandatory key {name}")
    except:
        try:
            json_body = request.data
            data = json_body[name]
            if data == "":
                raise APIException(f"missing mandatory key {name}")
        except:
            raise APIException(f"missing mandatory key {name}")

    return data


def optional_key(request, name, default_value=''):
    try:
        if request.method == 'GET':
            data = request.GET[name]
        else:
            data = request.POST[name]
        if data in ["", None, 'null', 'undefined']:
            data = default_value
    except:
        try:
            json_body = request.data
            data = json_body[name]
            if data in ["", None, 'null', 'undefined']:
                data = default_value
        except:
            data = default_value

    return data


