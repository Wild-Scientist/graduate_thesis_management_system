import React, { useEffect } from 'react';
import { useModel } from 'umi';
import vConsole from 'vconsole';
import Tools from '@/tools';

export default function VConsole() {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState;

  useEffect(() => {
    if (Tools.detectMob() && currentUser && currentUser.is_dev) {
      new vConsole();
    }
  }, [currentUser]);
  return null;
}
