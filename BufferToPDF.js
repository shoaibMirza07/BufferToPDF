import React, { useEffect, useState } from 'react'
import {
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Alert,
  ToastAndroid,
  PermissionsAndroid
} from 'react-native'
import { Buffer } from "buffer";
import RNFS from 'react-native-fs'
import { Block, Text, Button, Checkbox } from 'galio-framework'
import { baseTheme } from '../../constants'
import AntDesign from 'react-native-vector-icons/AntDesign'
import PatientDetailServices from '../../services/DoctorFlow/PatientDetail'
import InternetCheck from '../../services/InternetCheck'
const { width, height } = Dimensions.get('screen')


const BufferToPDF = ({ navigation }) => {

  const [appointmentDetail, setAppointmentDetail] = useState(null)
 
  const [appointmentId, setAppointmentId] = useState('')


  const askPermission = () => {
    async function requestExternalWritePermission() {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Pdf creator needs External Storage Write Permission',
            message: 'Pdf creator needs access to Storage data in your Internal storage.'
          }
        )
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          downloadPdf()
        } else {
          alert('WRITE_EXTERNAL_STORAGE permission denied')
        }
      } catch (err) {
        alert('Write permission err', err)
        console.warn(err)
      }
    }
    if (Platform.OS === 'android') {
      requestExternalWritePermission()
    } else {
      downloadPdf()
    }
  }
  const downloadPdf = async () => {
    if (!(await InternetCheck.isConnectionToInternet())) return
    PatientDetailServices.getPrescriptionPdf(appointmentId)
      .then(response => {
        if (response.status == 200) {
          let buffer = response.data.buffer.data
          const buff = Buffer.from(buffer, 'base64')
          let toStringBuff = buff.toString('base64')
          var path = RNFS.DownloadDirectoryPath + `/AppointmentDate${appointmentDetail && appointmentDetail.date}.pdf`;
          // write the file
          RNFS.writeFile(path, toStringBuff, 'base64')
            .then((success) => {
              showToastWithGravity('Download Succesfully')
            })
            .catch((err) => {
              showToastWithGravity(err.message);
            });

        } else if (response.status == 500) {
          showToastWithGravity('Internal server error.')
        }
        else if (response.status == 404) {
          showToastWithGravity('No pdf found.')
        }
        else {
          showToastWithGravity('Error !!')
        }
      }).catch(error => {
        showToastWithGravity('Some error occured.')
      })

  }


  return (
<Block
      style={{
        flexDirection: 'row',
        width: width * 0.9,
        marginTop: 32,
        alignItems: 'center'
      }}>
      <Block row style={{ marginLeft: 'auto' }}>
        <TouchableOpacity onPress={askPermission}>
          <Block
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: 'white',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: '#F1F4F7'
            }}>
            <AntDesign
              name={'download'}
              size={20}
              style={{
                color: baseTheme.COLORS.PRIMARY,
                alignSelf: 'center'
              }}
            />
          </Block>
        </TouchableOpacity>
      </Block>
    </Block>
  )
}

export default BufferToPDF
