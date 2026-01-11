import { message } from 'antd';
import { useIntl } from 'react-intl';

export const useCopy = () => {
    const intl = useIntl();

    const copy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            message.success(intl.formatMessage({ id: 'common.copySuccess' }));
            return true;
        } catch {
            message.error(intl.formatMessage({ id: 'common.copyFail' }));
            return false;
        }
    };

    return copy;
};
