
import { useState, ChangeEvent, useRef, useEffect } from 'react';
import styles from './index.less'

export default function HomePage() {
  const [imgList, setImgList] = useState<any[]>([])
  // 是否播放
  const [isPlay, setIsPlay] = useState<boolean>(false)
  // 当前视频
  const [videoFile, setVideoFile] = useState<string>()
  // viode ref
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // 获取视频总时长
  const getVideoDuration = (vdoFile: Blob) => {
    return new Promise<number>(resolve => {
      const vod = document.createElement('video') as HTMLVideoElement
      vod.muted = true
      vod.autoplay = true
      vod.src = URL.createObjectURL(vdoFile)
      vod.oncanplay = async () => {
        resolve(vod.duration)
      }
    })
  }

  useEffect(() => {
    setIsPlay(false)
  }, [videoFile])
  

  const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 判断是否是视频
      if (file.type.indexOf('video') === -1) {
        return
      }
      // 判断是否是mp4格式
      if (file.type.indexOf('mp4') === -1) {
        return
      }
      setVideoFile(URL.createObjectURL(file))
      const duration = await getVideoDuration(file)
      setImgList(new Array(10).fill(''))
      for (let index = 0; index < 10; index++) {
        captureFrame(file, index * duration / 10).then((res: any) => {
          setImgList(state => {
            state[index] = { ...res, time: index * duration / 10 }
            return [...state]
          })
        })

      }
    }

  }

  const drawVideo = (vdoFile: HTMLVideoElement) => {
    return new Promise<any>((resolve) => {
      const cvs = document.createElement('canvas') as HTMLCanvasElement
      const ctx = cvs.getContext('2d') as CanvasRenderingContext2D
      cvs.width = vdoFile.videoWidth
      cvs.height = vdoFile.videoHeight
      ctx.drawImage(vdoFile, 0, 0, cvs.width, cvs.height)
      cvs.toBlob((blob) => {
        resolve({
          blob,
          url: blob && URL.createObjectURL(blob)
        })
      })
    })
  }

  const captureFrame = (vdoFile: Blob, time: number) => {
    return new Promise((resolve => {
      const vod = document.createElement('video') as HTMLVideoElement
      vod.currentTime = time
      vod.muted = true
      vod.autoplay = true
      vod.src = URL.createObjectURL(vdoFile)
      vod.oncanplay = async () => {
        const frame = await drawVideo(vod)
        resolve(frame)
      }
    }))
  }
  return (
    <div className={styles.body}>
      <input type='file' accept='video/*' onChange={onChange} />
      {videoFile && <div className={styles['video-main']}>
        {/* 监听播放时间 */}
        <video src={videoFile} ref={videoRef} /* onTimeUpdate={(e: any) => {
          console.log(e.target?.currentTime); // 当前时间
        }}  */onPlay={() => {
          setIsPlay(true)
        }} onPause={() => {
          setIsPlay(false)
        }} />
        <span className={styles['play-btn']} onClick={() => {
          if (videoRef.current) {
            videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause()
          }
        }}>{!isPlay ? '播放' : '暂停'}</span>
      </div>}
      <div className={styles['img-list']}>
        {imgList.map((item, index) => <img src={item?.url || ''} key={index} onClick={() => {
          // 控制video 播放时间
          if (videoRef.current) {
            videoRef.current.paused && videoRef.current.play()
            Object.assign(videoRef.current, { currentTime: item.time })
          }
        }} />)}
      </div>
    </div>
  );
}
