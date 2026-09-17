type UpdateTitleEmit = (event: 'update:title', title: string) => void;

export function useTestTitleField(emit: UpdateTitleEmit) {
    const handleTitle = (value: string): void => {
        emit('update:title', value);
    };

    return {
        handleTitle,
    };
}
