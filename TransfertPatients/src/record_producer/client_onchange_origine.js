function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading || newValue == oldValue)
        return;
    g_form.clearValue('service_origine');
}
