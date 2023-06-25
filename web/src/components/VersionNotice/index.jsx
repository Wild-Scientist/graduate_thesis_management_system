import { Divider, Modal } from 'antd';
import { ClockCircleOutlined, TagOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';
import { useEffect } from 'react';
import semver from 'semver';
import { useRequest } from 'ahooks';
import { fetchOptionsRoles } from '@/services/options';
import { latestVersion } from '@/components/VersionNotice/service';

export default function VersionNotice() {
  const cookieVersionNoticeKey = 'versionNotice';
  useRequest(latestVersion, {
    onSuccess: (res) => {
      const tempVersion = Cookies.get(cookieVersionNoticeKey);
      const versionObj = res.data;
      if (versionObj) {
        const version = versionObj?.version;
        const shouldNoticeCon1 = !tempVersion;
        const shouldNoticeCon2 =
          tempVersion &&
          version &&
          semver.valid(tempVersion) &&
          semver.valid(version) &&
          semver.gt(version, tempVersion);
        if (shouldNoticeCon1 || shouldNoticeCon2) {
          Modal.info({
            title: (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>版本更新啦</span>
                <span style={{ fontSize: 13, color: '#595959' }}>
                  <TagOutlined style={{ marginRight: 5 }} />
                  <span>{version}</span>
                  <ClockCircleOutlined style={{ marginRight: 5, marginLeft: 10 }} />
                  <span>{versionObj?.created_at}</span>
                </span>
              </div>
            ),
            centered: true,
            width: 600,
            content: (
              <div>
                <Divider />
                <div
                  dangerouslySetInnerHTML={{ __html: versionObj?.content }}
                  style={{
                    maxHeight: '60vh',
                    overflow: 'auto',
                  }}
                />
              </div>
            ),
          });
          Cookies.set('versionNotice', version);
        }
      }
    },
  });
  // useEffect(() => {
  //
  //   window.axios.get(generateServerUrl('common/update/demoUpdateScene2latest')).then(res => {
  //     if (res.data?.success && res.data?.data) {
  //       const tempVersion = Cookies.get(cookieVersionNoticeKey)
  //       const versionObj = res.data?.data;
  //       const version = versionObj?.version;
  //
  //       const shouldNoticeCon1 = !tempVersion
  //       const shouldNoticeCon2 = tempVersion && version &&
  //         semver.valid(tempVersion) && semver.valid(version) &&
  //         semver.gt(version, tempVersion)
  //       if (shouldNoticeCon1 || shouldNoticeCon2) {
  //         Modal.info({
  //           title: (
  //             <div style={{display: 'flex', justifyContent: 'space-between'}}>
  //               <span>版本更新啦</span>
  //               <span style={{fontSize: 13, color: '#595959'}}>
  //                               <TagOutlined style={{marginRight: 5}}/>
  //                               <span>{version}</span>
  //                               <ClockCircleOutlined style={{marginRight: 5, marginLeft: 10}}/>
  //                               <span>{versionObj?.created_at}</span>
  //                               </span>
  //             </div>
  //           ),
  //           centered: true,
  //           width: 600,
  //           content: (
  //             <div>
  //               <Divider/>
  //               <div dangerouslySetInnerHTML={{__html: versionObj?.content}}/>
  //             </div>
  //           )
  //         });
  //         Cookies.set('versionNotice', version)
  //       }
  //     }
  //   })
  // }, [])
  return null;
}
