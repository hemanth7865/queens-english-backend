import { useIntl } from 'umi';
import { DefaultFooter } from '@ant-design/pro-layout';
import { Button } from 'antd';
import { BugOutlined } from '@ant-design/icons';

export default () => {
  const intl = useIntl();
  const defaultMessage = intl.formatMessage({
    id: 'app.copyright.produced',
    defaultMessage: `The Queen's English Limited`,
  });

  const currentYear = new Date().getFullYear();

  return (
    <DefaultFooter
      copyright={`${currentYear} ${defaultMessage}`}
      links={[
        {
          key: 'Raise a Ticket for Technical Issue',
          title: <><Button ><BugOutlined />Raise a Ticket for Technical Issue</Button></>,
          href: 'https://tqetechsupport.freshdesk.com/support/tickets/new',
          blankTarget: true,
        },
      ]}

    />
  );
};
